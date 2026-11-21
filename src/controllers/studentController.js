import User from '../models/User.js';
import Student from '../models/Student.js';
import Booking from '../models/Booking.js';
import asyncHandler from '../utils/asyncHandler.js';

const profileFields = ['phone', 'dateOfBirth', 'emergencyContact', 'preferredStyle'];

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await Student.findOne({ user: req.user._id }).populate('user', 'name email role');
  res.json({ profile });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of profileFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (req.body.name !== undefined) {
    if (typeof req.body.name !== 'string' || !req.body.name.trim()) {
      return res.status(400).json({ message: 'Name must not be empty.' });
    }
    await User.findByIdAndUpdate(req.user._id, { name: req.body.name.trim() }, { runValidators: true });
  }
  const profile = await Student.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true },
  ).populate('user', 'name email role');
  res.json({ profile });
});

export const listStudents = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const [students, total] = await Promise.all([
    Student.find().populate('user', 'name email createdAt').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Student.countDocuments(),
  ]);
  res.json({ students, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getStudent = asyncHandler(async (req, res) => {
  const profile = await Student.findById(req.params.id).populate('user', 'name email createdAt');
  if (!profile) return res.status(404).json({ message: 'Student not found.' });
  res.json({ profile });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const profile = await Student.findById(req.params.id);
  if (!profile) return res.status(404).json({ message: 'Student not found.' });
  if (req.body.name !== undefined && (typeof req.body.name !== 'string' || !req.body.name.trim())) {
    return res.status(400).json({ message: 'Name must not be empty.' });
  }

  for (const field of profileFields) {
    if (req.body[field] !== undefined) profile[field] = req.body[field];
  }
  await profile.save();
  if (req.body.name !== undefined) {
    await User.findByIdAndUpdate(profile.user, { name: req.body.name.trim() }, { runValidators: true });
  }
  await profile.populate('user', 'name email createdAt');
  res.json({ profile });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const profile = await Student.findById(req.params.id);
  if (!profile) return res.status(404).json({ message: 'Student not found.' });
  const hasBookings = await Booking.exists({ student: profile.user, status: 'booked' });
  if (hasBookings) return res.status(409).json({ message: 'Cancel the student’s active bookings before deactivating this account.' });

  await Promise.all([
    User.findByIdAndUpdate(profile.user, { active: false }),
    profile.deleteOne(),
  ]);
  res.json({ message: 'Student account deactivated.' });
});
