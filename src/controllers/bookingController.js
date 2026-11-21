import Booking from '../models/Booking.js';
import ClassSlot from '../models/ClassSlot.js';
import asyncHandler from '../utils/asyncHandler.js';

const populatedBooking = (query) => query
  .populate('student', 'name email')
  .populate({
    path: 'slot',
    populate: [
      { path: 'danceStyle', select: 'name slug' },
      { path: 'teacher', populate: { path: 'user', select: 'name' } },
    ],
  });

export const createBooking = asyncHandler(async (req, res) => {
  const slot = await ClassSlot.findOneAndUpdate(
    { _id: req.body.slotId, status: 'scheduled', startsAt: { $gt: new Date() }, $expr: { $lt: ['$seatsBooked', '$capacity'] } },
    { $inc: { seatsBooked: 1 } },
    { new: true },
  );
  if (!slot) return res.status(409).json({ message: 'This class is unavailable or fully booked.' });

  let booking;
  try {
    booking = await Booking.create({ student: req.user._id, slot: slot._id });
  } catch (error) {
    await ClassSlot.updateOne({ _id: slot._id, seatsBooked: { $gt: 0 } }, { $inc: { seatsBooked: -1 } });
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You already have a booking for this class.' });
    }
    throw error;
  }
  if (!(await ClassSlot.exists({ _id: slot._id, status: 'scheduled' }))) {
    const cancelledBooking = await Booking.findOneAndUpdate(
      { _id: booking._id, status: 'booked' },
      { status: 'cancelled', cancelledAt: new Date() },
    );
    if (cancelledBooking) {
      await ClassSlot.updateOne({ _id: slot._id, seatsBooked: { $gt: 0 } }, { $inc: { seatsBooked: -1 } });
    }
    return res.status(409).json({ message: 'This class was cancelled while your booking was being processed.' });
  }
  const populated = await populatedBooking(Booking.findById(booking._id));
  res.status(201).json({ booking: populated });
});

export const listMyBookings = asyncHandler(async (req, res) => {
  const bookings = await populatedBooking(Booking.find({ student: req.user._id })).sort({ createdAt: -1 });
  res.json({ bookings });
});

export const cancelMyBooking = asyncHandler(async (req, res) => {
  const existing = await Booking.findOne({
    _id: req.params.id,
    student: req.user._id,
    status: 'booked',
  }).select('slot');
  if (!existing) return res.status(404).json({ message: 'Active booking not found.' });
  const slot = await ClassSlot.findById(existing.slot).select('startsAt');
  if (slot && slot.startsAt.getTime() - Date.now() < 12 * 60 * 60 * 1000) {
    return res.status(409).json({ message: 'Bookings must be cancelled at least 12 hours before class.' });
  }
  const booking = await Booking.findOneAndUpdate(
    { _id: req.params.id, student: req.user._id, status: 'booked' },
    { status: 'cancelled', cancelledAt: new Date() },
    { new: true },
  );
  if (!booking) return res.status(404).json({ message: 'Active booking not found.' });
  await ClassSlot.updateOne({ _id: booking.slot, seatsBooked: { $gt: 0 } }, { $inc: { seatsBooked: -1 } });
  await booking.populate([
    { path: 'student', select: 'name email' },
    { path: 'slot', populate: [
      { path: 'danceStyle', select: 'name slug' },
      { path: 'teacher', populate: { path: 'user', select: 'name' } },
    ] },
  ]);
  res.json({ booking });
});

export const listBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const bookings = await populatedBooking(Booking.find(filter)).sort({ createdAt: -1 }).limit(200);
  res.json({ bookings });
});
