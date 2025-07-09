import { Request, Response } from 'express';
import { AdminService } from './Admin.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

const approveSecurity = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await AdminService.approveSecurity(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Security approved!",
    data: result,
  });
}
export const AdminController = {
  approveSecurity
};
