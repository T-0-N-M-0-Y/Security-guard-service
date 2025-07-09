import express from 'express';
import { fileUploader } from '../../../helpars/fileUploader';
import { SecurityController } from './Security.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';



const router = express.Router();

router.post('/submit-verification', auth(UserRole.SECURITY), fileUploader.uploadSingle, SecurityController.submitVerification);
router.get('/security-profiles', SecurityController.getAllSecurityProfiles);
router.get('/security-profile/:id', SecurityController.getSingleSecurityProfile);

export const SecurityRoutes = router;
