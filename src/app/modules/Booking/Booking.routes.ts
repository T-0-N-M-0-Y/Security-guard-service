import express from 'express';
import auth from '../../middlewares/auth';
import { BookingController } from './Booking.controller';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Create a new booking
router.post(
    '/create-booking',
    auth(UserRole.USER),
    BookingController.createBooking,
);

// Get all bookings
router.get('/my-bookings', auth(), BookingController.getMyBookings);

// Get a single booking by ID
router.get('/my-bookings/:bookingId', auth(), BookingController.getMyBookings);

// Update a data by bookingId
router.patch(
    '/confirm-booking/:bookingId',
    auth(UserRole.USER),
    BookingController.confirmBooking,
);

router.patch(
    '/payment-success/:bookingId', auth(UserRole.USER),
    BookingController.markPaymentSuccess
);

export const BookingRoutes = router;