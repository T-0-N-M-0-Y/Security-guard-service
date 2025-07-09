import express from 'express';
import { fileUploader } from '../../../helpars/fileUploader';
import { SecurityController } from './Security.controller';



const router = express.Router();

router.post('/submit-verification', fileUploader.uploadSingle, SecurityController.submitVerification);

export const SecurityRoutes = router;
