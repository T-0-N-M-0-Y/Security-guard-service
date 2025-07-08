import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { UserValidation } from "../User/user.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { authValidation } from "./auth.validation";

const router = express.Router();

router.post('/verify-email', AuthController.verifyEmailOtp);

router.post('/resend-verification', AuthController.resendVerificationOtp);

// user login route
router.post(
  "/login",
  validateRequest(UserValidation.UserLoginValidationSchema),
  AuthController.loginUser
);

// user logout route
router.post("/logout", AuthController.logoutUser);

//Get Profile
router.get(
  "/profile",
  auth(UserRole.ADMIN, UserRole.USER, UserRole.SECURITY),
  AuthController.getMyProfile
);

//Change Password
router.put(
  "/change-password",
  auth(),
  validateRequest(authValidation.changePasswordValidationSchema),
  AuthController.changePassword
);

router.post(
  '/forgot-password',
  AuthController.forgotPassword
);

router.post(
  '/resend-otp',
  AuthController.resendOtp
);

router.post(
  '/verify-otp',
  AuthController.verifyForgotPasswordOtp
);

router.post(
  '/reset-password',
  AuthController.resetPassword
)

export const AuthRoutes = router;
