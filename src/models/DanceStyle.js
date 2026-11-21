import mongoose from 'mongoose';

const danceStyleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true, maxlength: 100 },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export default mongoose.model('DanceStyle', danceStyleSchema);
