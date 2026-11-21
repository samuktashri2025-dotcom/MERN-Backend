import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phone: { type: String, trim: true, maxlength: 30 },
  dateOfBirth: { type: Date },
  emergencyContact: { type: String, trim: true, maxlength: 120 },
  preferredStyle: { type: String, trim: true, maxlength: 100 },
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
