import express from 'express';
import { SecurityController } from './security.controller';
import { fileUploader } from '../../../helpars/fileUploader';


const router = express.Router();

router.post('/submit-verification', fileUploader.uploadSingle, SecurityController.submitVerification);

export const SecurityRoutes = router;
