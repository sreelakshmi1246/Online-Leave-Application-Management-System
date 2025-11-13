import express from 'express';
import auth from '../middlewares/auth.js';
import roleCheck from '../middlewares/roleCheck.js';
import Mapping from '../models/Mapping.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * Admin: Assign a faculty to a student
 */
router.post('/assign', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { studentId, facultyId } = req.body;

    // check if both exist
    const student = await User.findById(studentId);
    const faculty = await User.findById(facultyId);
    if (!student || !faculty)
      return res.status(404).json({ message: 'Student or Faculty not found' });

    // check roles
    if (student.role !== 'student' || faculty.role !== 'faculty')
      return res.status(400).json({ message: 'Invalid roles' });

    // check if already mapped
    const existing = await Mapping.findOne({ student: studentId });
    if (existing)
      return res.status(400).json({ message: 'Student already mapped' });

    const map = new Mapping({ student: studentId, faculty: facultyId });
    await map.save();

    res.status(201).json({ message: 'Mapping created', mapping: map });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Admin: View all mappings
 */
router.get('/', auth, roleCheck('admin'), async (req, res) => {
  const mappings = await Mapping.find().populate('student', 'name email rollNo department')
                                       .populate('faculty', 'name email employeeId department');
  res.json(mappings);
});

/**
 * Admin: Delete a mapping
 */
router.delete('/:id', auth, roleCheck('admin'), async (req, res) => {
  await Mapping.findByIdAndDelete(req.params.id);
  res.json({ message: 'Mapping deleted' });
});

export default router;
