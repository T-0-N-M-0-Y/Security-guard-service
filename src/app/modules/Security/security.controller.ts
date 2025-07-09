import { Request, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { SecurityService } from './Security.service';

const submitVerification = async (req: Request, res: Response) => {
  const result = await SecurityService.submitVerification(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile verification submitted successfully!",
    data: result,
  });
}

export const SecurityController = {
  submitVerification
};
