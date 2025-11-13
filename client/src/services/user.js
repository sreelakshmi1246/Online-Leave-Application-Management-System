// client/src/services/user.js
import API from './api';

export const createUser = (data) => API.post('/admin/users', data);
export const listUsers = () => API.get('/admin/users');
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const importCSV = (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return API.post('/admin/import/csv', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
};
