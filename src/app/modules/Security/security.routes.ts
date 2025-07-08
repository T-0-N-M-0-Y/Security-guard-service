import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { securityController } from './security.controller';
import { securityValidation } from './security.validation';

const router = express.Router();

router.post(
'/',
auth(),
validateRequest(securityValidation.createSchema),
securityController.createSecurity,
);

router.get('/', auth(), securityController.getSecurityList);

router.get('/:id', auth(), securityController.getSecurityById);

router.put(
'/:id',
auth(),
validateRequest(securityValidation.updateSchema),
securityController.updateSecurity,
);

router.delete('/:id', auth(), securityController.deleteSecurity);

export const securityRoutes = router;