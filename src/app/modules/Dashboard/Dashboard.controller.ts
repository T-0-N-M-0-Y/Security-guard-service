import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { DashboardService } from './Dashboard.service';
import sendResponse from '../../../shared/sendResponse';


const getSecurityDashboard = catchAsync(async (req: Request, res: Response) => {
  const securityId = req.user?.id;
  const result = await DashboardService.getSecurityDashboard(securityId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashboard data fetched',
    data: result,
  });
})

export const DashboardController = {
  getSecurityDashboard
};