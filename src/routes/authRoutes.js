import { Router } from 'express';
import { body } from 'express-validator';
import { forgotPassword, login, register, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../validators/index.js';

const router = Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters.'),
  validate,
], register);
router.post('/login', [
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required.'),
  validate,
], login);
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  validate,
], forgotPassword);
router.post('/reset-password', [
  body('token').isString().notEmpty().withMessage('Reset token is required.'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters.'),
  validate,
], resetPassword);
router.get('/me', authenticate, (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

export default router;
