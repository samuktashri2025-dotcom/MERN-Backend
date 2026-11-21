import { Router } from 'express';
import { body } from 'express-validator';
import {
  createDanceStyle, deleteDanceStyle, listAllDanceStyles, listDanceStyles, updateDanceStyle,
} from '../controllers/danceStyleController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../validators/index.js';

const router = Router();

router.get('/', listDanceStyles);
router.get('/admin', authenticate, authorize('admin'), listAllDanceStyles);
router.post('/', authenticate, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Dance style name is required.'),
  validate,
], createDanceStyle);
router.patch('/:id', authenticate, authorize('admin'), updateDanceStyle);
router.delete('/:id', authenticate, authorize('admin'), deleteDanceStyle);

export default router;
