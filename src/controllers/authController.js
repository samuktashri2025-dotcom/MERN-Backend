import { createHash, randomBytes } from 'node:crypto';
import User from '../models/User.js';
import Student from '../models/Student.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createAuthToken } from '../utils/token.js';
import { sendPasswordResetEmail } from '../services/mailer.js';

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, classInterest } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    classInterest: typeof classInterest === 'string' ? classInterest.trim() : '',
  });
  try {
    await Student.create({ user: user._id, preferredStyle: user.classInterest });
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }

  res.status(201).json({
    message: 'Your account has been created.',
    token: createAuthToken(user),
    user: publicUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = req.body.password;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.active || !(await user.comparePassword(password || ''))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }

  res.json({ message: 'You are logged in.', token: createAuthToken(user), user: publicUser(user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });
  if (user) {
    const resetToken = randomBytes(32).toString('hex');
    user.resetPasswordTokenHash = createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  res.json({ message: 'If an account exists for that email, a reset link is on its way.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const tokenHash = createHash('sha256').update(String(req.body.token || '')).digest('hex');
  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordTokenHash +resetPasswordExpires');

  if (!user) return res.status(400).json({ message: 'The reset link is invalid or has expired.' });

  user.password = req.body.password;
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: 'Your password has been reset. You can now log in.' });
});
