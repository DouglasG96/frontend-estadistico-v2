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

const defaultDate = () => new Date().toISOString().split('T')[0];
const startOfYear = () => `${new Date().getFullYear()}-01-01`;

export default function ReporteServidores() {
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
      const response = await api.get('/reportes-estadisticos/servidores', {
        params: { fechaInicio, fechaFin, agrupar },
      });
      const rawData = response.data.data || [];
      const mapped = rawData.map((row) => ({
        periodo: row._id,
        servidores: row.servidores || 0,
        cantidadCultos: row.conteo || 0,
      }));
      setData(mapped);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totals = data.reduce(
    (acc, row) => ({
      servidores: acc.servidores + (row.servidores || 0),
      cantidadCultos: acc.cantidadCultos + (row.cantidadCultos || 0),
    }),
    { servidores: 0, cantidadCultos: 0 }
  );

  const average = data.length > 0 ? (totals.servidores / data.length).toFixed(1) : 0;

  const chartData = {
    labels: data.map((row) => row.periodo),
    datasets: [
      {
        label: 'Servidores',
        data: data.map((row) => row.servidores),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Tendencia de Servidores' } },
    scales: { y: { beginAtZero: true } },
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte de Servidores', 14, 20);
    doc.setFontSize(10);
    doc.text(`Periodo: ${fechaInicio} al ${fechaFin} | Agrupado por: ${agrupar}`, 14, 28);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 34);

    autoTable(doc, {
      startY: 40,
      head: [['Periodo', 'Servidores', 'Cantidad Cultos']],
      body: data.map((row) => [row.periodo, row.servidores, row.cantidadCultos]),
      foot: [['TOTAL', totals.servidores, totals.cantidadCultos]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [5, 150, 105] },
    });
    doc.save('reporte-servidores.pdf');
  };

  const exportExcel = () => {
    const wsData = [
      ['Periodo', 'Servidores', 'Cantidad Cultos'],
      ...data.map((row) => [row.periodo, row.servidores, row.cantidadCultos]),
      ['TOTAL', totals.servidores, totals.cantidadCultos],
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Servidores');
    XLSX.writeFile(wb, 'reporte-servidores.xlsx');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Reporte de Servidores</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Fecha Inicio</label>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Fecha Fin</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Agrupar por</label>
          <select value={agrupar} onChange={(e) => setAgrupar(e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
            <option value="año">Año</option>
          </select>
        </div>
        <button onClick={fetchData} disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total Servidores</p>
              <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>{totals.servidores.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Promedio</p>
              <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>{average}</p>
            </div>
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Cultos</p>
              <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>{totals.cantidadCultos.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="h-72"><Line data={chartData} options={chartOptions} /></div>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg)' }}>
                    {['Periodo', 'Servidores', 'Cantidad Cultos'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{row.periodo}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{(row.servidores || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{(row.cantidadCultos || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold" style={{ backgroundColor: 'var(--color-bg)' }}>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>TOTAL</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{totals.servidores.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{totals.cantidadCultos.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>No hay datos disponibles para el rango seleccionado</p>
        </div>
      )}
    </div>
  );
}
