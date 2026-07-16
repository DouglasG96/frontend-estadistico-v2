import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReporteTotalGeneral from './pages/ReporteTotalGeneral';
import ReporteServidores from './pages/ReporteServidores';
import ReporteAsistencia from './pages/ReporteAsistencia';
import ReporteTaberKids from './pages/ReporteTaberKids';
import ReporteComparativo from './pages/ReporteComparativo';
import SubirFoto from './pages/SubirFoto';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout><Dashboard /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/total-general"
              element={
                <PrivateRoute>
                  <Layout><ReporteTotalGeneral /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/servidores"
              element={
                <PrivateRoute>
                  <Layout><ReporteServidores /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/asistencia"
              element={
                <PrivateRoute>
                  <Layout><ReporteAsistencia /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/taber-kids"
              element={
                <PrivateRoute>
                  <Layout><ReporteTaberKids /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/comparativo"
              element={
                <PrivateRoute>
                  <Layout><ReporteComparativo /></Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/subir-foto"
              element={
                <PrivateRoute>
                  <Layout><SubirFoto /></Layout>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
