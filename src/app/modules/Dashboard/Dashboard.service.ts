import { startOfMonth, endOfMonth } from 'date-fns';
import prisma from '../../../shared/prisma';


const getSecurityDashboard = async (
  userId: string) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  console.log(`Fetching dashboard data for SecurityProfileId: ${userId} from ${monthStart} to ${monthEnd}`);
  
  const isExisting = await prisma.securityProfile.findUnique({
    where: { userId },
  });
  if (!isExisting) {
    throw new Error('Security Profile not found');
  }

  // 1. Earned this month (Paid bookings)
  const monthlyEarnings = await prisma.booking.aggregate({
    where: {
      SecurityProfileId: isExisting.id,
      paymentStatus: 'PAID',
      createdAt: { gte: monthStart, lte: monthEnd },
    },
    _sum: {
      totalBill: true,
    },
  });

  // 2. Total bookings
  const totalBookings = await prisma.booking.count({
    where: { SecurityProfileId: isExisting.id },
  });

  // 3. Due payment (Paid bookings not marked as withdrawn)
  const duePayments = await prisma.booking.aggregate({
    where: {
      SecurityProfileId: isExisting.id,
      paymentStatus: 'PAID',
      isWithdrawn: false,
    },
    _sum: {
      totalBill: true,
    },
  });

  // 4. Ongoing bookings
  const ongoingBookings = await prisma.booking.findMany({
    where: {
      SecurityProfileId: isExisting.id,
      status: { in: ['CONFIRMED', 'ON_THE_WAY', 'ARRIVED'] },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    monthlyEarnings: monthlyEarnings._sum.totalBill || 0,
    totalBookings,
    duePayments: duePayments._sum.totalBill || 0,
    ongoingBookings,
  };
}

export const DashboardService = {
  getSecurityDashboard
};