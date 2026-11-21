import { Router } from 'express';
import { body } from 'express-validator';
import { createContact, listContacts, updateContactStatus } from '../controllers/contactController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../validators/index.js';

const router = Router();

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Enter a valid email address.'),
  body('topic').optional().isString().isLength({ max: 120 }),
  body('message').trim().isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters.'),
  validate,
], createContact);
router.get('/admin', authenticate, authorize('admin'), listContacts);
router.patch('/admin/:id', authenticate, authorize('admin'), [
  body('status').isIn(['new', 'in_progress', 'resolved']).withMessage('Invalid contact status.'),
  validate,
], updateContactStatus);

export default router;
