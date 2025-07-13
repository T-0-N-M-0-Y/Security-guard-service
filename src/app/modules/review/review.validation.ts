import { z } from 'zod';

const createSchema = z.object({

    rating: z.number().int().min(1, 'Rating is required').max(5, 'Rating must be less than or equal to 5'),
    comment: z.string().optional(),

});

const updateSchema = z.object({

    rating: z.number().int().min(1, 'Rating is required').max(5, 'Rating must be less than or equal to 5'),
    comment: z.string().optional(),

});

export const reviewValidation = {
    createSchema,
    updateSchema,
};