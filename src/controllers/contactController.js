import Contact from '../models/Contact.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createContact = asyncHandler(async (req, res) => {
  const { name, email, topic, message } = req.body;
  if (typeof name !== 'string' || !name.trim()
    || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    || typeof message !== 'string' || message.trim().length < 10) {
    return res.status(400).json({ message: 'Enter your name, a valid email address, and a message of at least 10 characters.' });
  }
  await Contact.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    topic: typeof topic === 'string' ? topic.trim() : 'General enquiry',
    message: message.trim(),
  });
  res.status(201).json({ message: 'Thanks. We have your message and will reply by email soon.' });
});

export const listContacts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const messages = await Contact.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ messages });
});

export const updateContactStatus = asyncHandler(async (req, res) => {
  const message = await Contact.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true },
  );
  if (!message) return res.status(404).json({ message: 'Contact message not found.' });
  res.json({ message });
});
