import express from 'express';
import auth from '../../middlewares/auth';
import { SecurityBookmarkController } from './SecurityBookmark.controller';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Route to add a bookmark by user for a security profile
router.post(
    '/create-bookmark/:id',
    auth(UserRole.USER),
    SecurityBookmarkController.addBookmarkIntoDb
);

// Route to get all bookmarks for a user
router.get('/all-bookmark', auth(UserRole.USER), SecurityBookmarkController.getAllBookmarks);

// Route to remove a bookmark by user for a security profile
router.delete('/delete-bookmark/:id', auth(UserRole.USER), SecurityBookmarkController.removeBookmark);

export const SecurityBookmarkRoutes = router;