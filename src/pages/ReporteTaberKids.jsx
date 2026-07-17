import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { FileText, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const defaultDate = () => new Date().toISOString().split('T')[0];
const startOfYear = () => `${new Date().getFullYear()}-01-01`;

export default function ReporteTaberKids() {
  const [fechaInicio, setFechaInicio] = useState(startOfYear);
  const [fechaFin, setFechaFin] = useState(defaultDate);
  const [agrupar, setAgrupar] = useState('mes');
  const [tipo, setTipo] = useState('ambos');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reportes-estadisticos/taber-kids', {
        params: { fechaInicio, fechaFin, agrupar, tipo },
      });
      const rawData = response.data.data || [];
      const mapped = rawData.map((row) => ({
        periodo: row._id,
        kids: row.kids || 0,
        maestros: row.maestros || 0,
        total: (row.kids || 0) + (row.maestros || 0),
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
      kids: acc.kids + (row.kids || 0),
      maestros: acc.maestros + (row.maestros || 0),
      total: acc.total + (row.total || 0),
      cantidadCultos: acc.cantidadCultos + (row.cantidadCultos || 0),
    }),
    { kids: 0, maestros: 0, total: 0, cantidadCultos: 0 }
  );

  const chartData = {
    labels: data.map((row) => row.periodo),
    datasets: [
      {
        label: 'Kids',
        data: data.map((row) => row.kids || 0),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: '#f59e0b',
        borderWidth: 1,
      },
      {
        label: 'Maestros',
        data: data.map((row) => row.maestros || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: '#8b5cf6',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Kids vs Maestros por Periodo' } },
    scales: { y: { beginAtZero: true } },
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte Taber Kids', 14, 20);
    doc.setFontSize(10);
    doc.text(`Periodo: ${fechaInicio} al ${fechaFin} | Agrupado por: ${agrupar}`, 14, 28);
    doc.text(`Fecha de generacion: ${new Date().toLocaleDateString('es-ES')}`, 14, 34);

    autoTable(doc, {
      startY: 40,
      head: [['Periodo', 'Kids', 'Maestros', 'Total', 'Cultos']],
      body: data.map((row) => [row.periodo, row.kids || 0, row.maestros || 0, row.total || 0, row.cantidadCultos || 0]),
      foot: [['TOTAL', totals.kids, totals.maestros, totals.total, totals.cantidadCultos]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [245, 158, 11] },
    });
    doc.save('reporte-taber-kids.pdf');
  };

  const exportExcel = () => {
    const wsData = [
      ['Periodo', 'Kids', 'Maestros', 'Total', 'Cultos'],
      ...data.map((row) => [row.periodo, row.kids || 0, row.maestros || 0, row.total || 0, row.cantidadCultos || 0]),
      ['TOTAL', totals.kids, totals.maestros, totals.total, totals.cantidadCultos],
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Taber Kids');
    XLSX.writeFile(wb, 'reporte-taber-kids.xlsx');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Reporte Taber Kids</h1>

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
            <option value="año">{'A\u00f1o'}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
            <option value="ambos">Ambos</option>
            <option value="maestros">Maestros</option>
            <option value="ninos">Niños</option>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Kids</p>
              <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>{totals.kids.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Maestros</p>
              <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>{totals.maestros.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total</p>
              <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>{totals.total.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Cultos</p>
              <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>{totals.cantidadCultos.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="h-72"><Bar data={chartData} options={chartOptions} /></div>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg)' }}>
                    {['Periodo', 'Kids', 'Maestros', 'Total', 'Cultos'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{row.periodo}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{(row.kids || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{(row.maestros || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{(row.total || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{(row.cantidadCultos || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold" style={{ backgroundColor: 'var(--color-bg)' }}>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>TOTAL</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{totals.kids.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{totals.maestros.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text)' }}>{totals.total.toLocaleString()}</td>
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
