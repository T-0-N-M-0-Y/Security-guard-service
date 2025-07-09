import express from 'express';
import { fileUploader } from '../../../helpars/fileUploader';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { SecurityController } from './security.controller';

const router = express.Router();

//Security verification form approved
router.post('/submit-verification', auth(UserRole.SECURITY), fileUploader.uploadSingle, SecurityController.submitVerification);

//Get all security data
router.get('/security-profiles', SecurityController.getAllSecurityProfiles);

//Get single security data
router.get('/security-profiles/:id', SecurityController.getSingleSecurityProfile);

export const SecurityRoutes = router;
