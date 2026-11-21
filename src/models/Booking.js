import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSlot', required: true },
  status: { type: String, enum: ['booked', 'cancelled'], default: 'booked', index: true },
  cancelledAt: { type: Date },
}, { timestamps: true });

bookingSchema.index(
  { student: 1, slot: 1 },
  { unique: true, partialFilterExpression: { status: 'booked' } },
);
bookingSchema.index({ student: 1, status: 1, createdAt: -1 });
bookingSchema.index({ slot: 1, status: 1 });

export default mongoose.model('Booking', bookingSchema);
