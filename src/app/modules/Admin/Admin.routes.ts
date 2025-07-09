import express from 'express';
import { AdminController } from './Admin.controller';


const router = express.Router();

router.patch('/approve/:id', AdminController.approveSecurity);

export const AdminRoutes = router;
