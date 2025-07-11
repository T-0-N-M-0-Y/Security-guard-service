import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { BookingStatus, PaymentStatus } from "@prisma/client";

// Create a new booking in the database
// This function handles the creation of a booking, including validation and conflict checks.
// It takes the userId and payload as parameters, where payload contains booking details.
const createBookingIntoDb = async (userId: string, payload: any) => {
  const {
    SecurityProfileId,
    pickup,
    dropoff,
    appointmentAt,
    pickupTime,
    serviceHours,
    bookingNotes,
  } = payload;

  const securityProfile = await prisma.securityProfile.findUnique({ where: { id: SecurityProfileId } });
  console.log('Security Profile found:', SecurityProfileId);
  if (!securityProfile) throw new ApiError(httpStatus.NOT_FOUND, 'Invalid or unapproved Security Profile');

  if (serviceHours < 2 || serviceHours > 10) {
    throw new Error('Service hours must be between 2 and 10');
  }

  const startTime = new Date(pickupTime);
  const endTime = new Date(startTime.getTime() + serviceHours * 60 * 60 * 1000);

  const conflict = await prisma.booking.findFirst({
    where: {
      SecurityProfileId,
      status: {
        in: ['PENDING', 'ON_THE_WAY', 'ARRIVED', 'CONFIRMED'],
      },
      OR: [
        {
          pickupTime: { lte: startTime },
          serviceEndTime: { gt: startTime },
        },
        {
          pickupTime: { lt: endTime },
          serviceEndTime: { gte: endTime },
        },
        {
          pickupTime: { gte: startTime },
          serviceEndTime: { lte: endTime },
        },
      ],
    },
  });
  if (conflict) {
    throw new Error('Selected Security guard is already booked in this time range');
  }

  const hourlyRate = securityProfile.hourlyRate || 0;
  const totalPrice = hourlyRate * serviceHours;

  return prisma.booking.create({
    data: {
      userId,
      SecurityProfileId,
      pickup,
      dropoff,
      appointmentAt: new Date(appointmentAt),
      pickupTime: new Date(pickupTime),
      serviceEndTime: new Date(endTime),
      serviceHours,
      totalBill: totalPrice || (hourlyRate * serviceHours),
      bookingNotes: bookingNotes || '',
      status: 'PENDING',
      paymentStatus: 'PENDING',
    },
  });
}

// Get all bookings for a user
const getMyBookings = async (userId: string) => {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      SecurityProfile: {
        include: { user: true },
      },
    },
  });
}

// Get a single booking by ID
const getSingleBooking = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      SecurityProfile: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }
  return booking;
};

//confirm status of booking after giving bookingnotes
const confirmPlaceOrder = async (bookingId: string, userId: string, bookingNotes: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== userId) throw new ApiError(400, 'Unauthorized or invalid booking');
  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      bookingNotes,
      status: BookingStatus.CONFIRMED,
    },
  });
}

//Stripe will call this after successful payment
const markPaymentSuccess = async (bookingId: string) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: PaymentStatus.PAID,
    },
  });
}

//Security updates Booking status
const updateBookingStatusBySecurity = async (bookingId: string, SecurityProfileId: string, status: BookingStatus) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  console.log(booking);
  console.log("Security Profile ID:", SecurityProfileId);
  
  if (!booking || booking.SecurityProfileId !== booking.SecurityProfileId) throw new ApiError(400, 'Booking not found');

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
}

export const BookingService = {
  createBookingIntoDb,
  getMyBookings,
  getSingleBooking,
  confirmPlaceOrder,
  markPaymentSuccess,
  updateBookingStatusBySecurity
};