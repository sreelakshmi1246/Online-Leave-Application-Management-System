import express from 'express';
import auth from '../middlewares/auth.js';
import roleCheck from '../middlewares/roleCheck.js';
import { uploadCSV } from '../config/multer.js';
import { bulkImportStudents } from '../controllers/adminController.js';
import User from '../models/User.js';

const router = express.Router();

// add user (admin only)
router.post('/users', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { name, email, password, role, department, program, rollNo, employeeId } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const user = new User({ name, email, password, role, department, program, rollNo, employeeId });
    await user.save();
    res.status(201).json({ message: 'User created', userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// list users (admin)
router.get('/users', auth, roleCheck('admin'), async (req, res) => {
  const users = await User.find().select('-password').limit(200); // pagination later
  res.json(users);
});

// delete user (admin)
router.delete('/users/:id', auth, roleCheck('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// CSV bulk import (admin only)
router.post('/import/csv', auth, roleCheck('admin'), uploadCSV.single('file'), bulkImportStudents);

export default router;
