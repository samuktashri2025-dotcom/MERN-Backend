import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true, maxlength: 300 },
  answer: { type: String, required: true, trim: true, maxlength: 5000 },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

faqSchema.index({ active: 1, order: 1 });

export default mongoose.model('FAQ', faqSchema);
