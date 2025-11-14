// client/src/services/leave.js
import API from './api';

export const applyLeave = (formData) =>
  API.post('/leave/apply', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const myLeaves = () => API.get('/leave/mine');
export const cancelLeave = (id) => API.post(`/leave/${id}/cancel`);
export const facultyLeaves = (status) =>
  API.get(`/leave/faculty${status ? `?status=${status}` : ''}`);

export const approveLeave = (id, remarks='') => API.post(`/leave/${id}/approve`, { remarks });
export const rejectLeave = (id, remarks='') => API.post(`/leave/${id}/reject`, { remarks });
