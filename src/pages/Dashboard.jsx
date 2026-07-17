import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3,
  Users,
  Users2,
  Baby,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const reportCards = [
  {
    title: 'Total General',
    description: 'Reporte consolidado con todos los registros por período',
    icon: BarChart3,
    path: '/total-general',
    color: 'bg-blue-600',
  },
  {
    title: 'Servidores',
    description: 'Estadísticas de servidores por período',
    icon: Users,
    path: '/servidores',
    color: 'bg-emerald-600',
  },
  {
    title: 'Asistencia',
    description: 'Detalle de asistencia: Templo e Iglesia al Aire',
    icon: Users2,
    path: '/asistencia',
    color: 'bg-violet-600',
  },
  {
    title: 'Taber Kids',
    description: 'Estadísticas de niños y maestros de Taber Kids',
    icon: Baby,
    path: '/taber-kids',
    color: 'bg-amber-600',
  },
  {
    title: 'Comparativo Anual',
    description: 'Comparación de métricas entre años',
    icon: TrendingUp,
    path: '/comparativo',
    color: 'bg-rose-600',
  },
  {
    title: 'Subir Foto',
    description: 'Subir imágenes al sistema',
    icon: Upload,
    path: '/subir-foto',
    color: 'bg-cyan-600',
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Bienvenido, {user?.nombreCompleto || user?.usuario || 'Usuario'}
        </h1>
        <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Sistema de Reportes Estadísticos - Iglesia Taber Central
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.path}
              to={card.path}
              className="group rounded-xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg ${card.color} text-white flex-shrink-0`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3
                    className="font-semibold text-sm group-hover:text-blue-600 transition-colors"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-xs mt-1 leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
