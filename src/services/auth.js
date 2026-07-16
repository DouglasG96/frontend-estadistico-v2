import api from './api';

export const login = async (usuario, clave) => {
  const response = await api.post('/sesiones/login', { usuario, clave });
  const { token, usuario: username, usuarioId, nombreCompleto, nombreRol, rolId, sectorTemploId, cultoId } = response.data;
  const userData = { usuario: username, usuarioId, nombreCompleto, nombreRol, rolId, sectorTemploId, cultoId };
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData));
  return { token, user: userData };
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!getToken();
};
