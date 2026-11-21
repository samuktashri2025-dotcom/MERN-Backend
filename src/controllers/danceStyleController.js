import DanceStyle from '../models/DanceStyle.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listDanceStyles = asyncHandler(async (_req, res) => {
  const styles = await DanceStyle.find({ active: true }).sort({ name: 1 });
  res.json({ danceStyles: styles });
});

export const listAllDanceStyles = asyncHandler(async (_req, res) => {
  const styles = await DanceStyle.find().sort({ name: 1 });
  res.json({ danceStyles: styles });
});

export const createDanceStyle = asyncHandler(async (req, res) => {
  const name = req.body.name.trim();
  const slug = (req.body.slug || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const danceStyle = await DanceStyle.create({ name, slug, description: req.body.description || '' });
  res.status(201).json({ danceStyle });
});

export const updateDanceStyle = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of ['name', 'slug', 'description', 'active']) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (typeof updates.slug === 'string') updates.slug = updates.slug.trim().toLowerCase();
  const danceStyle = await DanceStyle.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!danceStyle) return res.status(404).json({ message: 'Dance style not found.' });
  res.json({ danceStyle });
});

export const deleteDanceStyle = asyncHandler(async (req, res) => {
  const danceStyle = await DanceStyle.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!danceStyle) return res.status(404).json({ message: 'Dance style not found.' });
  res.json({ message: 'Dance style archived.' });
});
