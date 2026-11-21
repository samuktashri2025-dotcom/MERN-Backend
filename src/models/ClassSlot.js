import mongoose from 'mongoose';

const classSlotSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  danceStyle: { type: mongoose.Schema.Types.ObjectId, ref: 'DanceStyle', required: true, index: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
  startsAt: { type: Date, required: true, index: true },
  endsAt: { type: Date, required: true },
  capacity: { type: Number, required: true, min: 1, max: 200 },
  seatsBooked: { type: Number, default: 0, min: 0 },
  level: { type: String, trim: true, maxlength: 60, default: 'All levels' },
  room: { type: String, trim: true, maxlength: 100, default: '' },
  status: { type: String, enum: ['scheduled', 'cancelled', 'completed'], default: 'scheduled', index: true },
}, { timestamps: true });

classSlotSchema.index({ teacher: 1, startsAt: 1, endsAt: 1 });

export default mongoose.model('ClassSlot', classSlotSchema);
