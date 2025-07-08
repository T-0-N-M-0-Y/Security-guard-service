import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { securityService } from './security.service';

const createSecurity = catchAsync(async (req, res) => {
  const result = await securityService.createIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Security created successfully',
    data: result,
  });
});

const getSecurityList = catchAsync(async (req, res) => {
  const result = await securityService.getListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Security list retrieved successfully',
    data: result,
  });
});

const getSecurityById = catchAsync(async (req, res) => {
  const result = await securityService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Security details retrieved successfully',
    data: result,
  });
});

const updateSecurity = catchAsync(async (req, res) => {
  const result = await securityService.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Security updated successfully',
    data: result,
  });
});

const deleteSecurity = catchAsync(async (req, res) => {
  const result = await securityService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Security deleted successfully',
    data: result,
  });
});

export const securityController = {
  createSecurity,
  getSecurityList,
  getSecurityById,
  updateSecurity,
  deleteSecurity,
};