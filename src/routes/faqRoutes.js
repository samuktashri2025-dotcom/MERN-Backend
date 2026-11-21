import { Router } from 'express';
import { body } from 'express-validator';
import {
  createFAQ, deleteFAQ, listAllFAQs, listFAQs, updateFAQ,
} from '../controllers/faqController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../validators/index.js';

const router = Router();

router.get('/', listFAQs);
router.get('/admin', authenticate, authorize('admin'), listAllFAQs);
router.post('/', authenticate, authorize('admin'), [
  body('question').trim().notEmpty().withMessage('Question is required.').isLength({ max: 300 }),
  body('answer').trim().notEmpty().withMessage('Answer is required.').isLength({ max: 5000 }),
  body('order').optional().isInt().toInt(),
  body('active').optional().isBoolean().toBoolean(),
  validate,
], createFAQ);
router.patch('/:id', authenticate, authorize('admin'), updateFAQ);
router.delete('/:id', authenticate, authorize('admin'), deleteFAQ);

export default router;
