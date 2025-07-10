import express from 'express';
import auth from '../../middlewares/auth';
import { BookingController } from './Booking.controller';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
'/create-booking',
auth(UserRole.USER),
BookingController.createBooking,
);

router.get('/my-bookings', auth(), BookingController.getMyBookings);

router.get('/my-booking/:id', auth(), BookingController.getMyBookings);

router.put(
'/confirm-booking',
auth(UserRole.USER),
BookingController.confirmBooking,
);

export const BookingRoutes = router;