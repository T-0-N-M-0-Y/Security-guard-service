import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { DashboardController } from './Dashboard.controller';

const router = express.Router();

router.get('/security-dashboard', auth(UserRole.SECURITY), DashboardController.getSecurityDashboard);

export const DashboardRoutes = router;