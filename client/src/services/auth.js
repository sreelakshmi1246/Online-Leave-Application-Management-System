// client/src/services/auth.js
import API from './api';

export const loginRequest = (email, password) => API.post('/auth/login', { email, password });

// optional: if you want a profile endpoint later
export const getProfile = () => API.get('/auth/profile');

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
