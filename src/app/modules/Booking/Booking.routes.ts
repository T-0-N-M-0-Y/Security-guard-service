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

//STRIPE: Mark booking as paid (this would ideally be called by webhook)
router.patch(
    '/payment-success/:bookingId', auth(UserRole.USER),
    BookingController.markPaymentSuccess
);

// Security: Status updates → on-the-way, arrived, Mark as complete
router.patch(
    '/update-status/:bookingId',
    auth(UserRole.SECURITY),
    BookingController.updateBookingStatusBySecurity
);

// USER: Approve service after completion
router.patch(
  '/approve-service/:bookingId',
  auth(UserRole.USER),
  BookingController.approveServicebyUser
);

export const BookingRoutes = router;