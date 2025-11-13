import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // mapped FA
  type: { type: String, enum: ['casual', 'medical', 'duty', 'other'], required: true },
  fromDate: Date,
  toDate: Date,
  days: Number,
  reason: String,
  attachments: [String], // file paths
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  remarks: String,
  createdAt: { type: Date, default: Date.now }
});

const LeaveRequest = mongoose.model('LeaveRequest', leaveSchema);
export default LeaveRequest;
