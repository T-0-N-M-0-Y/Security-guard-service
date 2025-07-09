import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpars/fileUploader";

const router = express.Router();

// *!register user
router.post(
  "/register",
  // validateRequest(UserValidation.CreateUserValidationSchema),
  userController.createUser
);

// *!get all  user
router.get("/", auth(UserRole.ADMIN), userController.getUsers);

// *!profile user
router.put(
  "/profile",
  // validateRequest(UserValidation.userUpdateSchema),
  auth(UserRole.ADMIN, UserRole.USER, UserRole.SECURITY),
  fileUploader.uploadSingle,
  userController.updateProfile
);

// *!update  user
router.put("/:id", auth(UserRole.ADMIN), userController.updateUser);

export const userRoutes = router;
