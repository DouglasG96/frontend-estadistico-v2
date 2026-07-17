import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Church, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usuario.trim() || !contrasena.trim()) {
      setError('Por favor ingrese usuario y contraseña');
      return;
    }

    try {
      await login(usuario, contrasena);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error ||
        'Credenciales incorrectas. Intente de nuevo.'
      );
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        {/* Header */}
        <div className="bg-blue-600 px-8 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 mb-4">
            <Church className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Taber Central</h1>
          <p className="text-blue-100 text-sm mt-1">Sistema Estadístico</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8">
          <h2
            className="text-lg font-semibold text-center mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text)' }}
              htmlFor="usuario"
            >
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              placeholder="Ingrese su usuario"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text)' }}
              htmlFor="contrasena"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="contrasena"
                type={showPassword ? 'text' : 'password'}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="w-full px-4 py-2.5 pr-11 rounded-lg border text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
