// client/src/services/notifications.js
import API from './api';

export const getNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.post(`/notifications/${id}/read`);
