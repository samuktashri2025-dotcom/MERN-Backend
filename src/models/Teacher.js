import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  dayOfWeek: { type: Number, min: 0, max: 6, required: true },
  startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
}, { _id: false });

const teacherSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, trim: true, maxlength: 2000, default: '' },
  danceStyles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DanceStyle' }],
  availability: [availabilitySchema],
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

teacherSchema.index({ danceStyles: 1, active: 1 });

export default mongoose.model('Teacher', teacherSchema);
