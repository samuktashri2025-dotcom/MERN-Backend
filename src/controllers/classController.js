import ClassSlot from '../models/ClassSlot.js';
import Booking from '../models/Booking.js';
import Teacher from '../models/Teacher.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listSlots = asyncHandler(async (req, res) => {
  const filter = { status: 'scheduled', startsAt: { $gte: new Date() } };
  if (req.query.teacher) filter.teacher = req.query.teacher;
  if (req.query.danceStyle) filter.danceStyle = req.query.danceStyle;
  if (req.query.from) filter.startsAt.$gte = new Date(req.query.from);
  if (req.query.to) filter.startsAt.$lte = new Date(req.query.to);
  const slots = await ClassSlot.find(filter)
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
    .populate('danceStyle', 'name slug')
    .sort({ startsAt: 1 });
  res.json({ slots });
});

export const listAllSlots = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status && ['scheduled', 'cancelled', 'completed'].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  if (req.query.teacher) filter.teacher = req.query.teacher;
  if (req.query.from || req.query.to) {
    filter.startsAt = {};
    if (req.query.from) filter.startsAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.startsAt.$lte = new Date(req.query.to);
  }
  const slots = await ClassSlot.find(filter)
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } })
    .populate('danceStyle', 'name slug')
    .sort({ startsAt: 1 })
    .limit(500);
  res.json({ slots });
});

export const getTeacherAvailability = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ _id: req.params.teacherId, active: true })
    .populate('user', 'name')
    .select('user availability');
  if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });
  const filter = { teacher: teacher._id, status: 'scheduled', startsAt: { $gte: new Date() } };
  if (req.query.from) filter.startsAt.$gte = new Date(req.query.from);
  if (req.query.to) filter.startsAt.$lte = new Date(req.query.to);
  const slots = await ClassSlot.find(filter).sort({ startsAt: 1 }).select('title startsAt endsAt capacity seatsBooked');
  res.json({ teacher, slots });
});

export const createSlot = asyncHandler(async (req, res) => {
  const { title, danceStyle, teacher: teacherId, startsAt, endsAt, capacity, level, room } = req.body;
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
    return res.status(400).json({ message: 'Provide valid class start and end times.' });
  }
  const teacher = await Teacher.findOne({ _id: teacherId, active: true });
  if (!teacher) return res.status(404).json({ message: 'Active teacher not found.' });

  const day = start.getUTCDay();
  const startTime = start.toISOString().slice(11, 16);
  const endTime = end.toISOString().slice(11, 16);
  if (teacher.availability.length && !teacher.availability.some((availability) => (
    availability.dayOfWeek === day
    && availability.startTime <= startTime
    && availability.endTime >= endTime
  ))) {
    return res.status(409).json({ message: 'The class falls outside this teacher’s configured availability.' });
  }

  const conflict = await ClassSlot.exists({
    teacher: teacherId,
    status: 'scheduled',
    startsAt: { $lt: end },
    endsAt: { $gt: start },
  });
  if (conflict) return res.status(409).json({ message: 'The teacher already has a class during that time.' });

  const slot = await ClassSlot.create({
    title, danceStyle, teacher: teacherId, startsAt: start, endsAt: end, capacity, level, room,
  });
  await slot.populate([{ path: 'teacher', populate: { path: 'user', select: 'name' } }, { path: 'danceStyle', select: 'name slug' }]);
  res.status(201).json({ slot });
});

export const updateSlot = asyncHandler(async (req, res) => {
  const slot = await ClassSlot.findById(req.params.id);
  if (!slot) return res.status(404).json({ message: 'Class slot not found.' });
  if (req.body.status === 'cancelled') {
    return res.status(400).json({ message: 'Use DELETE /api/slots/:id to cancel a class.' });
  }
  for (const field of ['title', 'danceStyle', 'teacher', 'startsAt', 'endsAt', 'capacity', 'level', 'room', 'status']) {
    if (req.body[field] !== undefined) slot[field] = req.body[field];
  }
  if (slot.capacity < slot.seatsBooked) {
    return res.status(409).json({ message: 'Capacity cannot be lower than the number of active bookings.' });
  }
  if (slot.endsAt <= slot.startsAt) return res.status(400).json({ message: 'Class end time must be after its start time.' });
  const teacher = await Teacher.findOne({ _id: slot.teacher, active: true });
  if (!teacher) return res.status(404).json({ message: 'Active teacher not found.' });
  const day = slot.startsAt.getUTCDay();
  const startTime = slot.startsAt.toISOString().slice(11, 16);
  const endTime = slot.endsAt.toISOString().slice(11, 16);
  if (teacher.availability.length && !teacher.availability.some((availability) => (
    availability.dayOfWeek === day
    && availability.startTime <= startTime
    && availability.endTime >= endTime
  ))) {
    return res.status(409).json({ message: 'The class falls outside this teacher’s configured availability.' });
  }
  const conflict = await ClassSlot.exists({
    _id: { $ne: slot._id },
    teacher: slot.teacher,
    status: 'scheduled',
    startsAt: { $lt: slot.endsAt },
    endsAt: { $gt: slot.startsAt },
  });
  if (conflict) return res.status(409).json({ message: 'The teacher already has a class during that time.' });
  await slot.save();
  await slot.populate([{ path: 'teacher', populate: { path: 'user', select: 'name' } }, { path: 'danceStyle', select: 'name slug' }]);
  res.json({ slot });
});

export const cancelSlot = asyncHandler(async (req, res) => {
  const slot = await ClassSlot.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled' },
    { new: true, runValidators: true },
  );
  if (!slot) return res.status(404).json({ message: 'Class slot not found.' });
  await Booking.updateMany(
    { slot: slot._id, status: 'booked' },
    { status: 'cancelled', cancelledAt: new Date() },
  );
  slot.seatsBooked = 0;
  await slot.save();
  res.json({ slot });
});
