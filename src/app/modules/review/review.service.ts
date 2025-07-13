import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

// Function to create a review in the database
const createReviewIntoDb = async (userId: string, data: any) => {
  const { bookingId, rating, comment } = data;
  console.log(`Creating review for user ${userId} with data:`, data);


  if (!bookingId || !rating) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Booking ID and rating are required');
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Rating must be between 1 and 5');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { SecurityProfile: true },
  });

  if (!booking || booking.userId !== userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  if (booking.status !== 'COMPLETED') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Service must be approved before reviewing');
  }

  // Check if review already exists
  const existingReview = await prisma.review.findFirst({
    where: { bookingId },
  });

  if (existingReview) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Review already submitted for this booking');
  }

  const review = await prisma.review.create({
    data: {
      bookingId,
      userId,
      SecurityProfileId: booking.SecurityProfileId,
      rating,
      comment,
    },
  });

  // Recalculate average rating for the guard
  const avg = await prisma.review.aggregate({
    where: { SecurityProfileId: booking.SecurityProfileId },
    _avg: { rating: true },
  });

  await prisma.securityProfile.update({
    where: { id: booking.SecurityProfileId },
    data: { avgRating: avg._avg.rating || 0 },
  });

  return review;
};

// Function to get reviews for a specific security guard
const getReviewsForSecurityGuard = async (SecurityProfileId: string) => {
  const SecurityGuard = await prisma.securityProfile.findUnique({
    where: { id: SecurityProfileId },
  });

  if (!SecurityGuard) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Security guard not found');
  }

  // Get all reviews with user info
  const reviews = await prisma.review.findMany({
    where: {
      SecurityProfileId
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalReviews = reviews.length;

  // Count and calculate percentage for each star rating (1-5)
  const ratingSummary = await Promise.all(
    [1, 2, 3, 4, 5].map(async (star) => {
      const count = await prisma.review.count({
        where: {
          SecurityProfileId,
          rating: star,
        },
      });

      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

      return {
        rating: star,
        count,
        percentage: parseFloat(percentage.toFixed(2)), // Rounded to 2 decimal places
      };
    })
  );

  return {
    totalReviews,
    ratingSummary,
    reviews,
  };
};

export const reviewService = {
  createReviewIntoDb,
  getReviewsForSecurityGuard
};