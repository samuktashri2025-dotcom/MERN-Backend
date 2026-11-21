import Booking from '../models/Booking.js';
import ClassSlot from '../models/ClassSlot.js';
import Contact from '../models/Contact.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

export const dashboard = asyncHandler(async (_req, res) => {
  const [students, teachers, upcomingClasses, activeBookings, newMessages, recentBookings] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments({ active: true }),
    ClassSlot.countDocuments({ status: 'scheduled', startsAt: { $gte: new Date() } }),
    Booking.countDocuments({ status: 'booked' }),
    Contact.countDocuments({ status: 'new' }),
    Booking.find().sort({ createdAt: -1 }).limit(10)
      .populate('student', 'name email')
      .populate({ path: 'slot', populate: [{ path: 'danceStyle', select: 'name' }, { path: 'teacher', populate: { path: 'user', select: 'name' } }] }),
  ]);
  res.json({ dashboard: { students, teachers, upcomingClasses, activeBookings, newMessages, recentBookings } });
});

export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role && ['student', 'teacher', 'admin'].includes(req.query.role)) filter.role = req.query.role;
  const users = await User.find(filter).select('name email role createdAt').sort({ createdAt: -1 }).limit(200);
  res.json({ users });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['student', 'teacher', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Role must be student, teacher, or admin.' });
  }
  if (req.params.id === req.user.id && role !== 'admin') {
    return res.status(400).json({ message: 'You cannot remove your own admin role.' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true })
    .select('name email role createdAt');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own account.' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.role === 'admin' && await User.countDocuments({ role: 'admin' }) <= 1) {
    return res.status(409).json({ message: 'The final admin account cannot be deleted.' });
  }
  if (await Booking.exists({ student: user._id, status: 'booked' })) {
    return res.status(409).json({ message: 'Cancel the user’s active bookings before deleting this account.' });
  }
  const teacher = await Teacher.findOne({ user: user._id });
  if (teacher && await ClassSlot.exists({ teacher: teacher._id, status: 'scheduled', startsAt: { $gte: new Date() } })) {
    return res.status(409).json({ message: 'Reassign or cancel this teacher’s upcoming classes before deleting the account.' });
  }
  await Promise.all([
    User.findByIdAndDelete(user._id),
    Student.deleteMany({ user: user._id }),
    Teacher.deleteMany({ user: user._id }),
    Booking.deleteMany({ student: user._id }),
  ]);
  res.json({ message: 'User and related profiles removed.' });
});
