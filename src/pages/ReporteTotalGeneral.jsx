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
  Filler,
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { FileText, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const defaultDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const startOfYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-01-01`;
};

export default function ReporteTotalGeneral() {
  const [fechaInicio, setFechaInicio] = useState(startOfYear);
  const [fechaFin, setFechaFin] = useState(defaultDate);
  const [agrupar, setAgrupar] = useState('mes');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reportes-estadisticos/total-general', {
        params: { fechaInicio, fechaFin, agrupar },
      });
      const rawData = response.data.data || [];
      // Map API response fields to frontend display names
      const mapped = rawData.map((row) => ({
        periodo: row._id,
        totalGeneral: row.totalGeneral || 0,
        asistencia: row.totalAsistencia || 0,
        templo: row.templo || 0,
        iglesiaAlAire: row.iglesiaAlAire || 0,
        servidores: row.servidores || 0,
        kids: row.kids || 0,
        cantidadCultos: row.conteo || 0,
      }));
      setData(mapped);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totals = data.reduce(
    (acc, row) => ({
      totalGeneral: acc.totalGeneral + (row.totalGeneral || 0),
      asistencia: acc.asistencia + (row.asistencia || 0),
      templo: acc.templo + (row.templo || 0),
      iglesiaAlAire: acc.iglesiaAlAire + (row.iglesiaAlAire || 0),
      servidores: acc.servidores + (row.servidores || 0),
      kids: acc.kids + (row.kids || 0),
      cantidadCultos: acc.cantidadCultos + (row.cantidadCultos || 0),
    }),
    { totalGeneral: 0, asistencia: 0, templo: 0, iglesiaAlAire: 0, servidores: 0, kids: 0, cantidadCultos: 0 }
  );

  const chartData = {
    labels: data.map((row) => row.periodo),
    datasets: [
      {
        label: 'Total General',
        data: data.map((row) => row.totalGeneral),
        borderColor: '#1e40af',
        backgroundColor: 'rgba(30, 64, 175, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Tendencia del Total General' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte Total General', 14, 20);
    doc.setFontSize(10);
    doc.text(`Periodo: ${fechaInicio} al ${fechaFin} | Agrupado por: ${agrupar}`, 14, 28);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 34);

    autoTable(doc, {
      startY: 40,
      head: [['Periodo', 'Total General', 'Asistencia', 'Templo', 'Iglesia al Aire', 'Servidores', 'Kids', 'Cultos']],
      body: data.map((row) => [
        row.periodo,
        row.totalGeneral,
        row.asistencia,
        row.templo,
        row.iglesiaAlAire,
        row.servidores,
        row.kids,
        row.cantidadCultos,
      ]),
      foot: [['TOTALES', totals.totalGeneral, totals.asistencia, totals.templo, totals.iglesiaAlAire, totals.servidores, totals.kids, totals.cantidadCultos]],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 64, 175] },
    });

    doc.save('reporte-total-general.pdf');
  };

  const exportExcel = () => {
    const wsData = [
      ['Periodo', 'Total General', 'Asistencia', 'Templo', 'Iglesia al Aire', 'Servidores', 'Kids', 'Cultos'],
      ...data.map((row) => [
        row.periodo,
        row.totalGeneral,
        row.asistencia,
        row.templo,
        row.iglesiaAlAire,
        row.servidores,
        row.kids,
        row.cantidadCultos,
      ]),
      ['TOTALES', totals.totalGeneral, totals.asistencia, totals.templo, totals.iglesiaAlAire, totals.servidores, totals.kids, totals.cantidadCultos],
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Total General');
    XLSX.writeFile(wb, 'reporte-total-general.xlsx');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
        Reporte Total General
      </h1>

      {/* Filters */}
      <div
        className="flex flex-wrap items-end gap-4 p-4 rounded-xl border"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Fecha Inicio
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Fecha Fin
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Agrupar por
          </label>
          <select
            value={agrupar}
            onChange={(e) => setAgrupar(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
            <option value="año">Año</option>
          </select>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Consultar
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={exportPDF}
            disabled={data.length === 0}
            className="px-3 py-2 rounded-lg text-sm font-medium border hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center gap-1.5 text-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={exportExcel}
            disabled={data.length === 0}
            className="px-3 py-2 rounded-lg text-sm font-medium border hover:bg-green-50 disabled:opacity-50 transition-colors flex items-center gap-1.5 text-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      )}

      {/* Summary Cards */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total General', value: totals.totalGeneral },
            { label: 'Asistencia', value: totals.asistencia },
            { label: 'Servidores', value: totals.servidores },
            { label: 'Cultos', value: totals.cantidadCultos },
          ].map((card) => (
            <div
              key={card.label}
              className="p-4 rounded-xl border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {card.label}
              </p>
              <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>
                {card.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {!loading && data.length > 0 && (
        <div
          className="p-4 rounded-xl border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="h-72">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && data.length > 0 && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg)' }}>
                  {['Periodo', 'Total General', 'Asistencia', 'Templo', 'Iglesia al Aire', 'Servidores', 'Kids', 'Cultos'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                      {row.periodo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                      {(row.totalGeneral || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                      {(row.asistencia || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                      {(row.templo || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                      {(row.iglesiaAlAire || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                      {(row.servidores || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                      {(row.kids || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                      {(row.cantidadCultos || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                    TOTAL
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                    {totals.totalGeneral.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                    {totals.asistencia.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                    {totals.templo.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                    {totals.iglesiaAlAire.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                    {totals.servidores.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                    {totals.kids.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
                    {totals.cantidadCultos.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && data.length === 0 && (
        <div
          className="text-center py-12 rounded-xl border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>No hay datos disponibles para el rango seleccionado</p>
        </div>
      )}
    </div>
  );
}
