import { Request, Response } from 'express';
import { SecurityService } from './security.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { userFilterableFields } from '../User/user.costant';
import catchAsync from '../../../shared/catchAsync';

const submitVerification = catchAsync(async (req: Request, res: Response) => {
  const result = await SecurityService.submitVerification(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile verification submitted successfully!",
    data: result,
  });
})

const getAllSecurityProfiles = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
  const result = await SecurityService.getAllSecurityProfiles(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "'Security profiles fetched'!",
    data: result,
  });
})

const getSingleSecurityProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SecurityService.getSingleSecurityProfile(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "'Security profile fetched'!",
    data: result,
  });
})

export const SecurityController = {
  submitVerification,
  getAllSecurityProfiles,
  getSingleSecurityProfile
};
