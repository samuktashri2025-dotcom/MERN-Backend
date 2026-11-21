import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import ClassSlot from '../models/ClassSlot.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listTeachers = asyncHandler(async (_req, res) => {
  const teachers = await Teacher.find({ active: true })
    .populate('user', 'name')
    .populate('danceStyles', 'name slug')
    .sort({ createdAt: -1 });
  res.json({ teachers });
});

export const listAllTeachers = asyncHandler(async (_req, res) => {
  const teachers = await Teacher.find()
    .populate('user', 'name email active')
    .populate('danceStyles', 'name slug')
    .sort({ createdAt: -1 });
  res.json({ teachers });
});

export const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ _id: req.params.id, active: true })
    .populate('user', 'name')
    .populate('danceStyles', 'name slug');
  if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });
  res.json({ teacher });
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id })
    .populate('user', 'name email role')
    .populate('danceStyles', 'name slug');
  if (!teacher) return res.status(404).json({ message: 'Teacher profile not found.' });
  res.json({ teacher });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  if (!teacher) return res.status(404).json({ message: 'Teacher profile not found.' });
  for (const field of ['bio', 'danceStyles', 'availability']) {
    if (req.body[field] !== undefined) teacher[field] = req.body[field];
  }
  await teacher.save();
  await teacher.populate([{ path: 'user', select: 'name email role' }, { path: 'danceStyles', select: 'name slug' }]);
  res.json({ teacher });
});

export const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, bio = '', danceStyles = [], availability = [] } = req.body;
  const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password, role: 'teacher' });
  try {
    const teacher = await Teacher.create({ user: user._id, bio, danceStyles, availability });
    await teacher.populate([{ path: 'user', select: 'name email role' }, { path: 'danceStyles', select: 'name slug' }]);
    res.status(201).json({ teacher });
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });
  if (req.body.active === false && await ClassSlot.exists({
    teacher: teacher._id,
    status: 'scheduled',
    startsAt: { $gte: new Date() },
  })) {
    return res.status(409).json({ message: 'Reassign or cancel this teacher’s upcoming classes before deactivating the profile.' });
  }
  for (const field of ['bio', 'danceStyles', 'availability', 'active']) {
    if (req.body[field] !== undefined) teacher[field] = req.body[field];
  }
  await teacher.save();
  if (req.body.name !== undefined || req.body.email !== undefined || req.body.password !== undefined) {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.email !== undefined) updates.email = req.body.email;
    if (req.body.password !== undefined) updates.password = await bcrypt.hash(req.body.password, 12);
    await User.findByIdAndUpdate(teacher.user, updates, { runValidators: true });
  }
  await teacher.populate([{ path: 'user', select: 'name email role' }, { path: 'danceStyles', select: 'name slug' }]);
  res.json({ teacher });
});

export const deactivateTeacher = asyncHandler(async (req, res) => {
  if (await ClassSlot.exists({
    teacher: req.params.id,
    status: 'scheduled',
    startsAt: { $gte: new Date() },
  })) {
    return res.status(409).json({ message: 'Reassign or cancel this teacher’s upcoming classes before deactivating the profile.' });
  }
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });
  res.json({ message: 'Teacher deactivated.' });
});
