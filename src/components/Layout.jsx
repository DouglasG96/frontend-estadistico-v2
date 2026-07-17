import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Church,
  BarChart3,
  Users,
  Users2,
  Baby,
  TrendingUp,
  Upload,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Home,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Inicio', icon: Home },
  { path: '/total-general', label: 'Total General', icon: BarChart3 },
  { path: '/servidores', label: 'Servidores', icon: Users },
  { path: '/asistencia', label: 'Asistencia', icon: Users2 },
  { path: '/taber-kids', label: 'Taber Kids', icon: Baby },
  { path: '/comparativo', label: 'Comparativo Anual', icon: TrendingUp },
  { path: '/subir-foto', label: 'Subir Foto', icon: Upload },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-50 h-full w-64 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#1e293b' }}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-600/50">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
            <Church className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white truncate">Taber Central</h1>
            <p className="text-xs text-slate-400 truncate">Sistema Estadístico</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-3 border-t border-slate-600/50">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm font-semibold">
              {user?.nombre?.[0] || user?.usuario?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.nombreCompleto || user?.usuario || 'Usuario'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.nombreRol || ''}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center gap-4 px-4 lg:px-6 h-14 border-b flex-shrink-0"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-black/5"
            style={{ color: 'var(--color-text)' }}
          >
            <Menu className="w-5 h-5" />
          </button>

          <h2
            className="hidden sm:block text-base font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            Estadístico Taber Central
          </h2>

          <div className="flex-1" />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-black/5"
            style={{ color: 'var(--color-text-secondary)' }}
            title={darkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {user?.nombreCompleto || user?.usuario}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 dark:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
