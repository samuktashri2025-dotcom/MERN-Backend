import FAQ from '../models/FAQ.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listFAQs = asyncHandler(async (_req, res) => {
  const faqs = await FAQ.find({ active: true }).sort({ order: 1, createdAt: 1 });
  res.json({ faqs });
});

export const listAllFAQs = asyncHandler(async (_req, res) => {
  const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
  res.json({ faqs });
});

export const createFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.create(req.body);
  res.status(201).json({ faq });
});

export const updateFAQ = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of ['question', 'answer', 'order', 'active']) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  const faq = await FAQ.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!faq) return res.status(404).json({ message: 'FAQ not found.' });
  res.json({ faq });
});

export const deleteFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!faq) return res.status(404).json({ message: 'FAQ not found.' });
  res.json({ message: 'FAQ archived.' });
});
