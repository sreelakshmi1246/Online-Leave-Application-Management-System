import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const seed = async () => {
  await connectDB();
  const exists = await User.findOne({ email: 'admin@college.edu' });
  if (exists) {
    console.log('Admin exists:', exists.email);
    process.exit(0);
  }
  const admin = new User({
    name: 'Admin',
    email: 'admin@college.edu',
    password: 'Admin@123', // change after first login
    role: 'admin'
  });
  await admin.save();
  console.log('Admin created: admin@college.edu / Admin@123');
  process.exit(0);
};

seed();
