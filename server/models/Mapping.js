import mongoose from 'mongoose';

const mappingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Mapping = mongoose.model('Mapping', mappingSchema);
export default Mapping;
