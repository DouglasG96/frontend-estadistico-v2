import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { FileText, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const METRICAS_OPTIONS = [
  { value: 'totalGeneral', label: 'Total General' },
  { value: 'totalAsistencia', label: 'Total Asistencia' },
  { value: 'iglesiaAlAire', label: 'Iglesia al Aire' },
  { value: 'servidores', label: 'Servidores' },
];

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const CHART_COLORS = ['#1e40af', '#059669', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReporteComparativo() {
  const [year, setYear] = useState('');
  const [anios, setAnios] = useState([]);
  const [selectedMetricas, setSelectedMetricas] = useState(['totalGeneral']);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnios = async () => {
      try {
        const response = await api.get('/reportes-estadisticos/anios-disponibles');
        const aniosData = response.data.data || response.data || [];
        setAnios(aniosData);
        if (aniosData.length > 0) {
          // Select the most recent year
          const sorted = [...aniosData].sort((a, b) => b - a);
          setYear(sorted[0]);
        }
      } catch (err) {
        console.error('Error fetching years:', err);
      }
    };
    fetchAnios();
  }, []);

  const fetchData = async () => {
    if (!year) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reportes-estadisticos/comparativo', {
        params: { year, metricas: selectedMetricas.join(',') },
      });
      const rawData = response.data.data || [];
      // Map flat API response {mes, totalGeneral_actual, totalGeneral_anterior, ...}
      // to nested structure {mes, totalGeneral: {actual, anterior, diferencia, porcentaje}, ...}
      const mapped = rawData.map((row) => {
        const result = { mes: row.mes, mesNum: row.mesNum };
        selectedMetricas.forEach((m) => {
          result[m] = {
            actual: row[`${m}_actual`] || 0,
            anterior: row[`${m}_anterior`] || 0,
            diferencia: row[`${m}_diferencia`] || 0,
            porcentaje: row[`${m}_porcentaje`] || 0,
          };
        });
        return result;
      });
      setData(mapped);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los datos comparativos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (year) fetchData();
  }, [year]);

  const toggleMetrica = (value) => {
    setSelectedMetricas((prev) => {
      if (prev.includes(value)) {
        return prev.filter((m) => m !== value);
      }
      return [...prev, value];
    });
  };

  const selectAllMetricas = () => {
    setSelectedMetricas(METRICAS_OPTIONS.map((m) => m.value));
  };

  const prevYear = year ? String(Number(year) - 1) : '';

  // Compute totals for the summary
  const computeTotals = (metrica) => {
    let totalActual = 0;
    let totalAnterior = 0;
    data.forEach((row) => {
      totalActual += row[metrica]?.actual || 0;
      totalAnterior += row[metrica]?.anterior || 0;
    });
    const diferencia = totalActual - totalAnterior;
    const porcentaje = totalAnterior > 0 ? ((diferencia / totalAnterior) * 100).toFixed(1) : 'N/A';
    return { totalActual, totalAnterior, diferencia, porcentaje };
  };

  const chartData = (metrica) => {
    const metricaLabel = METRICAS_OPTIONS.find((m) => m.value === metrica)?.label || metrica;
    return {
      labels: MESES,
      datasets: [
        {
          label: `${year} (Actual)`,
          data: data.map((row) => row[metrica]?.actual || 0),
          borderColor: '#1e40af',
          backgroundColor: 'rgba(30, 64, 175, 0.1)',
          fill: false,
          tension: 0.3,
        },
        {
          label: `${prevYear} (Anterior)`,
          data: data.map((row) => row[metrica]?.anterior || 0),
          borderColor: '#94a3b8',
          backgroundColor: 'rgba(148, 163, 184, 0.1)',
          fill: false,
          tension: 0.3,
          borderDash: [5, 5],
        },
      ],
    };
  };

  const chartOptions = (metricaLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: true, text: `Comparativo: ${metricaLabel}` } },
    scales: { y: { beginAtZero: true } },
  });

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Reporte Comparativo Anual - ${year}`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Fecha de generacion: ${new Date().toLocaleDateString('es-ES')}`, 14, 25);

    let startY = 32;

    selectedMetricas.forEach((metrica) => {
      const metricaLabel = METRICAS_OPTIONS.find((m) => m.value === metrica)?.label || metrica;

      doc.setFontSize(12);
      doc.text(metricaLabel, 14, startY);
      startY += 5;

      const header = ['Mes', `${year}`, `${prevYear}`, 'Diferencia', '% Cambio'];
      const body = data.map((row) => {
        const actual = row[metrica]?.actual || 0;
        const anterior = row[metrica]?.anterior || 0;
        const diff = actual - anterior;
        const pct = anterior > 0 ? ((diff / anterior) * 100).toFixed(1) + '%' : 'N/A';
        return [row.mes || '', actual, anterior, diff, pct];
      });

      const totals = computeTotals(metrica);
      body.push(['TOTAL', totals.totalActual, totals.totalAnterior, totals.diferencia, totals.porcentaje + '%']);

      autoTable(doc, {
        startY,
        head: [header],
        body,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 64, 175] },
      });

      startY = doc.lastAutoTable.finalY + 12;
    });

    doc.save(`reporte-comparativo-${year}.pdf`);
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    selectedMetricas.forEach((metrica) => {
      const metricaLabel = METRICAS_OPTIONS.find((m) => m.value === metrica)?.label || metrica;
      const wsData = [
        ['Mes', `${year} (Actual)`, `${prevYear} (Anterior)`, 'Diferencia', '% Cambio'],
        ...data.map((row) => {
          const actual = row[metrica]?.actual || 0;
          const anterior = row[metrica]?.anterior || 0;
          const diff = actual - anterior;
          const pct = anterior > 0 ? ((diff / anterior) * 100).toFixed(1) + '%' : 'N/A';
          return [row.mes || '', actual, anterior, diff, pct];
        }),
      ];
      const totals = computeTotals(metrica);
      wsData.push(['TOTAL', totals.totalActual, totals.totalAnterior, totals.diferencia, totals.porcentaje + '%']);
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, metricaLabel);
    });

    XLSX.writeFile(wb, `reporte-comparativo-${year}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Comparativo Anual</h1>

      {/* Filters */}
      <div className="p-4 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Año</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <option value="">{'Seleccionar a\u00f1o'}</option>
              {anios.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchData}
            disabled={loading || !year}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Consultar
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={exportPDF} disabled={data.length === 0} className="px-3 py-2 rounded-lg text-sm font-medium border hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center gap-1.5 text-red-600 dark:text-red-400 dark:hover:bg-red-900/20" style={{ borderColor: 'var(--color-border)' }}>
              <FileText className="w-4 h-4" /> PDF
            </button>
            <button onClick={exportExcel} disabled={data.length === 0} className="px-3 py-2 rounded-lg text-sm font-medium border hover:bg-green-50 disabled:opacity-50 transition-colors flex items-center gap-1.5 text-green-600 dark:text-green-400 dark:hover:bg-green-900/20" style={{ borderColor: 'var(--color-border)' }}>
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
          </div>
        </div>

        {/* Metricas checkboxes */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Métricas</label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={selectAllMetricas}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
              style={{
                borderColor: 'var(--color-border)',
                color: selectedMetricas.length === METRICAS_OPTIONS.length ? '#1e40af' : 'var(--color-text)',
                backgroundColor: selectedMetricas.length === METRICAS_OPTIONS.length ? 'rgba(30,64,175,0.1)' : 'transparent',
              }}
            >
              Todos
            </button>
            {METRICAS_OPTIONS.map((m) => (
              <button
                key={m.value}
                onClick={() => toggleMetrica(m.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                style={{
                  borderColor: selectedMetricas.includes(m.value) ? '#1e40af' : 'var(--color-border)',
                  color: selectedMetricas.includes(m.value) ? '#1e40af' : 'var(--color-text)',
                  backgroundColor: selectedMetricas.includes(m.value) ? 'rgba(30,64,175,0.1)' : 'transparent',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      )}

      {!loading && data.length > 0 && (
        <>
          {/* Summary cards for each metrica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedMetricas.map((metrica) => {
              const totals = computeTotals(metrica);
              const metricaLabel = METRICAS_OPTIONS.find((m) => m.value === metrica)?.label || metrica;
              const isPositive = totals.diferencia >= 0;
              return (
                <div key={metrica} className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{metricaLabel}</p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{totals.totalActual.toLocaleString()}</span>
                    <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{totals.porcentaje}%
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    vs {prevYear}: {totals.totalAnterior.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Charts for each metrica */}
          {selectedMetricas.map((metrica) => {
            const metricaLabel = METRICAS_OPTIONS.find((m) => m.value === metrica)?.label || metrica;
            return (
              <div key={`chart-${metrica}`} className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="h-72">
                  <Line data={chartData(metrica)} options={chartOptions(metricaLabel)} />
                </div>
              </div>
            );
          })}

          {/* Comparison Table */}
          {selectedMetricas.map((metrica) => {
            const metricaLabel = METRICAS_OPTIONS.find((m) => m.value === metrica)?.label || metrica;
            const totals = computeTotals(metrica);
            return (
              <div key={`table-${metrica}`} className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="px-4 py-3 font-semibold text-sm border-b" style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                  {metricaLabel}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-bg)' }}>
                        {['Mes', `${year} (Actual)`, `${prevYear} (Anterior)`, 'Diferencia', '% Cambio'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                      {data.map((row, i) => {
                        const actual = row[metrica]?.actual || 0;
                        const anterior = row[metrica]?.anterior || 0;
                        const diff = actual - anterior;
                        const pct = anterior > 0 ? ((diff / anterior) * 100).toFixed(1) : 'N/A';
                        const isPositive = diff >= 0;
                        return (
                          <tr key={i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{row.mes || MESES[i]}</td>
                            <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{actual.toLocaleString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{anterior.toLocaleString()}</td>
                            <td className={`px-4 py-3 whitespace-nowrap font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              {isPositive ? '+' : ''}{diff.toLocaleString()}
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              {pct !== 'N/A' ? `${isPositive ? '+' : ''}${pct}%` : 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="font-semibold" style={{ backgroundColor: 'var(--color-bg)' }}>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>TOTAL</td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{totals.totalActual.toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{totals.totalAnterior.toLocaleString()}</td>
                        <td className={`px-4 py-3 whitespace-nowrap ${totals.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {totals.diferencia >= 0 ? '+' : ''}{totals.diferencia.toLocaleString()}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap ${totals.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {totals.porcentaje !== 'N/A' ? `${totals.diferencia >= 0 ? '+' : ''}${totals.porcentaje}%` : 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      )}

      {!loading && !error && data.length === 0 && year && (
        <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>{'No hay datos disponibles para el a\u00f1o seleccionado'}</p>
        </div>
      )}
    </div>
  );
}
