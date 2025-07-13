import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { reviewController } from './review.controller';
import { reviewValidation } from './review.validation';

const router = express.Router();

router.post(
    '/create-review',
    auth(UserRole.USER),
    validateRequest(reviewValidation.createSchema),
    reviewController.createReview,
);

router.get('/get-reviews/:id', auth(), reviewController.getReviewsForSecurityGuard);

export const reviewRoutes = router;