import { Router } from 'express';
import {
  deleteStudent, getMyProfile, getStudent, listStudents, updateMyProfile, updateStudent,
} from '../controllers/studentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.get('/me', authorize('student'), getMyProfile);
router.patch('/me', authorize('student'), updateMyProfile);
router.get('/', authorize('admin'), listStudents);
router.get('/:id', authorize('admin'), getStudent);
router.patch('/:id', authorize('admin'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);

export default router;
