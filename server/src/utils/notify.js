import Notification from '../models/Notification.js';

export const sendNotification = async (userId, title, message) => {
  try {
    const notif = new Notification({ user: userId, title, message });
    await notif.save();
    console.log('Notification created for:', userId);
  } catch (err) {
    console.error('Notification error:', err);
  }
};
