import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BookingService } from './Booking.service';
import { Request, Response } from 'express';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const data = req.body;
  const result = await BookingService.createBookingIntoDb(userId, data);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Booking created successfully',
    data: result,
  });
});

const getmyBookingsByRole = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.user;
  const result = await BookingService.getmyBookingsByRole(id, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const result = await BookingService.getSingleBooking(bookingId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking retrieved successfully",
    data: result,
  });
});

const confirmBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { bookingId } = req.params;
  console.log('Booking ID:', bookingId);
  const { bookingNotes } = req.body;
  const result = await BookingService.confirmPlaceOrder(bookingId, userId, bookingNotes);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking confirmed successfully",
    data: result,
  });
});

const markPaymentSuccess = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const result = await BookingService.markPaymentSuccess(bookingId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment confirmed successfully',
    data: result,
  });
})

const updateBookingStatusBySecurity = catchAsync(async (req: Request, res: Response) => {
  const SecurityProfileId = req.user?.id;
  const { bookingId } = req.params;
  const { status } = req.body;

  const result = await BookingService.updateBookingStatusBySecurity(bookingId, SecurityProfileId, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Status updated to ${status}`,
    data: result,
  });
})

const approveServicebyUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { bookingId } = req.params;

  const result = await BookingService.approveServicebyUser(bookingId, userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service approved successfully',
    data: result,
  });
})

export const BookingController = {
  createBooking,
  getmyBookingsByRole,
  getSingleBooking,
  confirmBooking,
  markPaymentSuccess,
  updateBookingStatusBySecurity,
  approveServicebyUser
};