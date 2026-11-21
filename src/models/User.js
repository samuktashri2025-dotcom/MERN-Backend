import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student', index: true },
  active: { type: Boolean, default: true, index: true },
  classInterest: { type: String, trim: true, maxlength: 100 },
  resetPasswordTokenHash: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.set('toJSON', {
  transform(_doc, value) {
    delete value.password;
    delete value.resetPasswordTokenHash;
    delete value.resetPasswordExpires;
    return value;
  },
});

export default mongoose.model('User', userSchema);
