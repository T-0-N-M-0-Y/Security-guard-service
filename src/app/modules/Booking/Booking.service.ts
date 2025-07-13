import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { BookingStatus, PaymentStatus, UserRole } from "@prisma/client";

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
  console.log('Security Profile found:', SecurityProfileId, securityProfile);
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

// Get My bookings for a user, Security or admin
const getmyBookingsByRole = async (userId: string, role: UserRole) => {
  console.log('Fetching bookings for user ID:', userId, 'with role:', role);

  if (role === "USER") {
    return await prisma.booking.findMany({
      where: { userId },
      include: {
        SecurityProfile: {
          include: { user: true }, // security user details
        },
      },
    });
  }

  if (role === "SECURITY") {
    const profile = await prisma.securityProfile.findFirst({
      where: { userId },
    });
    if (!profile) throw new ApiError(404, "Security profile not found");
    return await prisma.booking.findMany({
      where: { SecurityProfileId: profile.id },
      include: {
        user: true, // booking user
      },
    });
  }
  
// Admin can see all bookings
  if (role === "ADMIN") {
    return await prisma.booking.findMany({
      include: {
        user: true,
        SecurityProfile: {
          include: { user: true },
        },
      },
    });
  }
  throw new ApiError(403, "Unauthorized role");
};

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
    data: { status }
  });
}

// Final approval by user after service complete
const approveServicebyUser = async (bookingId: string, userId: string) => {
  console.log('Approving service for booking ID:', bookingId, 'by user ID:', userId);

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  console.log('Booking found:', booking);

  if (!booking || booking.userId !== booking.userId) throw new Error('Unauthorized');
  if (booking.status !== BookingStatus.MARK_AS_COMPLETE) throw new ApiError(400, 'Not ready to approve');

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.COMPLETED }
  });
}

export const BookingService = {
  createBookingIntoDb,
  getmyBookingsByRole,
  getSingleBooking,
  confirmPlaceOrder,
  markPaymentSuccess,
  updateBookingStatusBySecurity,
  approveServicebyUser
};