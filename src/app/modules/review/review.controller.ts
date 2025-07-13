import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { reviewService } from "./review.service";
import sendResponse from "../../../shared/sendResponse";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await reviewService.createReviewIntoDb(userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
})

const getReviewsForSecurityGuard = catchAsync(async (req: Request, res: Response) => {
  const SecurityProfileId = req.params.id;
  const result = await reviewService.getReviewsForSecurityGuard(SecurityProfileId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reviews fetched successfully',
    data: result,
  });
})

export const reviewController = {
  createReview,
  getReviewsForSecurityGuard
};