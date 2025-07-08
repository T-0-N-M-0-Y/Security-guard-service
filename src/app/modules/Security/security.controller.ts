import { Request, Response } from 'express';
import { SecurityService } from './security.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

export const SecurityController = {
  submitVerification: async (req: Request, res: Response) => {
    const result = await SecurityService.submitVerification(req);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile Verified successfully!",
      data: result,
    });
  },
};
