import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  topic: { type: String, trim: true, maxlength: 120, default: 'General enquiry' },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
  status: { type: String, enum: ['new', 'in_progress', 'resolved'], default: 'new', index: true },
}, { timestamps: true });

contactSchema.index({ createdAt: -1 });

export default mongoose.model('Contact', contactSchema);
