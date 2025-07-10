import express from 'express';
import { fileUploader } from '../../../helpars/fileUploader';
import { SecurityController } from './security.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

//Security verification form approved
router.post('/submit-verification', auth(UserRole.SECURITY), fileUploader.uploadSingle, SecurityController.submitVerification);

//Get all security data
router.get('/security-profiles', SecurityController.getAllSecurityProfiles);

//Get single security data
router.get('/security-profiles/:id', SecurityController.getSingleSecurityProfile);

export const SecurityRoutes = router;
