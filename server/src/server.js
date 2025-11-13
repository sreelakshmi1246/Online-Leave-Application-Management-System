import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// route imports
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import leaveRoutes from './routes/leave.js';
import mappingRoutes from './routes/mapping.js';
import notificationRoutes from './routes/notification.js';


dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // parse JSON bodies
app.use(cors());         // allow cross-origin requests

// Serve uploaded files (attachments & csv) statically
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/mapping', mappingRoutes);
app.use('/api/notifications', notificationRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.send('Backend is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
