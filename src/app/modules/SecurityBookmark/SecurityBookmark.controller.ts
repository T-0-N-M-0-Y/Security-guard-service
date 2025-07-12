import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import httpStatus from 'http-status';
import { SecurityBookmarkService } from './SecurityBookmark.service';
import sendResponse from '../../../shared/sendResponse';

const addBookmarkIntoDb = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const SecurityProfileId = req.params.id;

  const result = await SecurityBookmarkService.addBookmarkIntoDb(userId, SecurityProfileId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'SecurityBookmark created successfully',
    data: result,
  });
});

const getAllBookmarks = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await SecurityBookmarkService.getAllBookmarks(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bookmarked guards retrieved',
    data: result,
  });
})

const removeBookmark = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const securityProfileId = req.params.id;
  const result = await SecurityBookmarkService.removeBookmark(userId, securityProfileId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bookmark removed',
    data: result,
  });
})

export const SecurityBookmarkController = {
  addBookmarkIntoDb,
  getAllBookmarks,
  removeBookmark,
};