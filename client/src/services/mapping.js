// client/src/services/mapping.js
import API from './api';

export const assignMapping = (studentId, facultyId) => API.post('/mapping/assign', { studentId, facultyId });
export const listMappings = () => API.get('/mapping');
export const deleteMapping = (id) => API.delete(`/mapping/${id}`);
