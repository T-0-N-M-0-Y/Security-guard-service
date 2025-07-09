import express from 'express';
import { AdminController } from './Admin.controller';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';


const router = express.Router();

router.patch('/approve/:userId', auth(UserRole.ADMIN), AdminController.approveSecurity);

export const AdminRoutes = router;
