import { SecurityProfile } from './../../../../node_modules/.prisma/client/index.d';
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { BookingStatus } from "@prisma/client";
import { log } from "console";
import { get } from 'http';

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
  // console.log('Incoming booking payload:', payload);
  console.log(await prisma.securityProfile.findMany());

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

  // Create the booking with basic info, no payment yet
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


export const BookingService = {
  createBookingIntoDb,
  getMyBookings,
  getSingleBooking,
  confirmPlaceOrder
};