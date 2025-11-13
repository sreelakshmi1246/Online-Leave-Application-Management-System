import LeaveRequest from '../models/LeaveRequests.js';
import Mapping from '../models/Mapping.js';
import User from '../models/User.js';
import { sendNotification } from '../utils/notify.js';

const msPerDay = 24 * 60 * 60 * 1000;
function calcDaysInclusive(fromDate, toDate) {
  const f = new Date(fromDate);
  const t = new Date(toDate);
  f.setHours(0,0,0,0);
  t.setHours(0,0,0,0);
  const diff = Math.round((t - f) / msPerDay) + 1;
  return diff > 0 ? diff : 0;
}

export const applyLeave = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    if (user.role !== 'student') return res.status(403).json({ message: 'Only students can apply' });

    const { type, fromDate, toDate, reason } = req.body;
    if (!type || !fromDate || !toDate) return res.status(400).json({ message: 'Missing fields' });

    const days = calcDaysInclusive(fromDate, toDate);
    if (days <= 0) return res.status(400).json({ message: 'Invalid dates' });

    // find mapped faculty (optional)
    const map = await Mapping.findOne({ student: user._id });
    const facultyId = map ? map.faculty : null;

    // check leave balance (change policy here if you want to deduct only on approval)
    if ((user.leaveBalance || 0) < days) {
      return res.status(400).json({ message: 'Insufficient leave balance' });
    }

    const attachments = [];
    if (req.files && req.files.length) {
      req.files.forEach(f => attachments.push(`/uploads/attachments/${f.filename}`));
    }

    const lr = new LeaveRequest({
      student: user._id,
      faculty: facultyId,
      type,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      days,
      reason,
      attachments,
      status: 'pending'
    });

    await lr.save();
    // notify faculty if mapped
    if (facultyId) {
      await sendNotification(facultyId, 'New Leave Request', `${user.name} applied for leave from ${fromDate} to ${toDate}`);
    }

    return res.status(201).json({ message: 'Leave applied', leave: lr });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const user = req.user;
    const leaves = await LeaveRequest.find({ student: user._id }).sort({ createdAt: -1 });
    return res.json(leaves);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const facultyList = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'faculty') return res.status(403).json({ message: 'Only faculty allowed' });

    const mappings = await Mapping.find({ faculty: user._id }).select('student');
    const studentIds = mappings.map(m => m.student);

    const filter = { student: { $in: studentIds } };
    if (req.query.status) filter.status = req.query.status;

    const leaves = await LeaveRequest.find(filter).populate('student', 'name rollNo email program department').sort({ createdAt: -1 });
    return res.json(leaves);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'faculty' && user.role !== 'admin') return res.status(403).json({ message: 'Only faculty or admin allowed' });

    const leaveId = req.params.id;
    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Only pending leaves can be approved' });

    if (user.role === 'faculty') {
      const mapping = await Mapping.findOne({ student: leave.student, faculty: user._id });
      if (!mapping) return res.status(403).json({ message: 'Not authorized to approve this student' });
    }

    leave.status = 'approved';
    leave.remarks = req.body.remarks || '';
    await leave.save();
    await sendNotification(leave.student, 'Leave Approved', `Your leave from ${leave.fromDate.toDateString()} to ${leave.toDate.toDateString()} was approved.`);


    // deduct leave balance
    const student = await User.findById(leave.student);
    student.leaveBalance = Math.max(0, (student.leaveBalance || 0) - (leave.days || 0));
    await student.save();

    return res.json({ message: 'Leave approved', leave });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'faculty' && user.role !== 'admin') return res.status(403).json({ message: 'Only faculty or admin allowed' });

    const leaveId = req.params.id;
    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Only pending leaves can be rejected' });

    if (user.role === 'faculty') {
      const mapping = await Mapping.findOne({ student: leave.student, faculty: user._id });
      if (!mapping) return res.status(403).json({ message: 'Not authorized to reject this student' });
    }

    leave.status = 'rejected';
    leave.remarks = req.body.remarks || '';
    await leave.save();
    await sendNotification(leave.student, 'Leave Rejected', `Your leave request from ${leave.fromDate.toDateString()} to ${leave.toDate.toDateString()} was rejected.`);


    return res.json({ message: 'Leave rejected', leave });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const user = req.user;
    const leaveId = req.params.id;
    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    if (String(leave.student) !== String(user._id)) return res.status(403).json({ message: 'Not authorized to cancel this leave' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Only pending leaves can be cancelled' });

    leave.status = 'cancelled';
    await leave.save();

    return res.json({ message: 'Leave cancelled' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
