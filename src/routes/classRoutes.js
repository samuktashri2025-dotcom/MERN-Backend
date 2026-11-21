import { Router } from 'express';
import { body } from 'express-validator';
import {
  cancelSlot, createSlot, getTeacherAvailability, listAllSlots, listSlots, updateSlot,
} from '../controllers/classController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../validators/index.js';

const router = Router();

router.get('/', listSlots);
router.get('/admin', authenticate, authorize('admin'), listAllSlots);
router.get('/availability/:teacherId', getTeacherAvailability);
router.post('/', authenticate, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Class title is required.'),
  body('danceStyle').isMongoId().withMessage('A valid dance style is required.'),
  body('teacher').isMongoId().withMessage('A valid teacher is required.'),
  body('startsAt').isISO8601().withMessage('Provide a valid start date and time.'),
  body('endsAt').isISO8601().withMessage('Provide a valid end date and time.'),
  body('capacity').isInt({ min: 1, max: 200 }).withMessage('Capacity must be between 1 and 200.').toInt(),
  validate,
], createSlot);
router.patch('/:id', authenticate, authorize('admin'), updateSlot);
router.delete('/:id', authenticate, authorize('admin'), cancelSlot);

export default router;
