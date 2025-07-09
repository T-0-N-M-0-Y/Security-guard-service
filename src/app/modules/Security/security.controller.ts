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

const getAllSecurityProfiles = async (req: Request, res: Response) => {
  const result = await SecurityService.getAllSecurityProfiles();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "'Security profiles fetched'!",
    data: result,
  });
}

const getSingleSecurityProfile = async (req: Request, res: Response) => {
  const {id} = req.params;
  const result = await SecurityService.getSingleSecurityProfile(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "'Security profile fetched'!",
    data: result,
  });
}

export const SecurityController = {
  submitVerification,
  getAllSecurityProfiles,
  getSingleSecurityProfile
};
