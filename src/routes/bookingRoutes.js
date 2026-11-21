import { Router } from 'express';
import {
  cancelMyBooking, createBooking, listBookings, listMyBookings,
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.get('/my-bookings', authorize('student'), listMyBookings);
router.post('/', authorize('student'), createBooking);
router.patch('/:id/cancel', authorize('student'), cancelMyBooking);
router.get('/admin', authorize('admin'), listBookings);

export default router;
