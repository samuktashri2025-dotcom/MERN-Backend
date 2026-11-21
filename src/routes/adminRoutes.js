import { Router } from 'express';
import { body } from 'express-validator';
import {
  dashboard, deleteUser, listUsers, updateUserRole,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../validators/index.js';

const router = Router();

router.use(authenticate, authorize('admin'));
router.get('/dashboard', dashboard);
router.get('/users', listUsers);
router.patch('/users/:id/role', [
  body('role').isIn(['student', 'teacher', 'admin']).withMessage('Role must be student, teacher, or admin.'),
  validate,
], updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
