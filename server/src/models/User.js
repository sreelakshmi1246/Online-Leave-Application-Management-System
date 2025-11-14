import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  // Student fields
  rollNo: { type: String },
  program: { type: String },
  year: { type: Number },
  
  // Faculty fields
  employeeId: { type: String },
  designation: { type: String },

  // Common fields
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String },
  role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },

   // NEW FIELDS for semester leave tracking
  casualLeaveUsed: { type: Number, default: 0 },  // out of 8
  medicalLeaveUsed: { type: Number, default: 0 }, // out of 7
  //leaveBalance: { type: Number, default: 20 },
  createdAt: { type: Date, default: Date.now }
});


// hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
