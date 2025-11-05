import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // to read JSON body
app.use(cors());         // allow cross-origin requests

// Connect to MongoDB
connectDB();

// Simple test route
app.get('/', (req, res) => {
  res.send('Backend is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
