import { Router } from 'express';
import { body } from 'express-validator';
import {
  createTeacher, deactivateTeacher, getMyProfile, getTeacher, listAllTeachers, listTeachers, updateMyProfile, updateTeacher,
} from '../controllers/teacherController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../validators/index.js';

const router = Router();

router.get('/', listTeachers);
router.get('/me', authenticate, authorize('teacher'), getMyProfile);
router.patch('/me', authenticate, authorize('teacher'), updateMyProfile);
router.get('/admin', authenticate, authorize('admin'), listAllTeachers);
router.get('/:id', getTeacher);
router.post('/', authenticate, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters.'),
  validate,
], createTeacher);
router.patch('/:id', authenticate, authorize('admin'), [
  body('name').optional().trim().notEmpty().withMessage('Name must not be empty.'),
  body('email').optional().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').optional().isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters.'),
  validate,
], updateTeacher);
router.delete('/:id', authenticate, authorize('admin'), deactivateTeacher);

export default router;
