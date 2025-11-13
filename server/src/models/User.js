import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String }, // students only
  employeeId: { type: String }, // faculty only
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String },
  program: { type: String }, // BTech, MTech etc
  role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
  leaveBalance: { type: Number, default: 20 }, // initial
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
