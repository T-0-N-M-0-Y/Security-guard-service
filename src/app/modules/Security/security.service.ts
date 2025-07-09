import { Request } from "express";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { fileUploader } from "../../../helpars/fileUploader";


const submitVerification = async (req: Request) => {
  const user = req.user as { id: string }; // assuming attached by auth middleware
  const payload = req.body;
  const file = req.file as Express.Multer.File; // assuming single file upload

  // Validate
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Certificate file is required");
  }

  const existing = await prisma.securityProfile.findUnique({ where: { userId: user.id } });
  if (existing) throw new ApiError(httpStatus.BAD_REQUEST, "Verification already submitted");

  const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!existingUser || existingUser.role !== "SECURITY") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid security user");
  }

  // Upload certificate to DigitalOcean
  const uploaded = await fileUploader.uploadToDigitalOcean(file); // returns { Location: string }

  // Create the security profile
  const data = {
    userId: user.id,
    phoneNumber: payload.phoneNumber,
    address: payload.permanentAddress,
    govtId: payload.govtId,
    securityCertificate: uploaded.Location,
    dateOfBirth: new Date(payload.dateOfBirth),
    about: payload.about,
    hourlyRate: Number(payload.hourlyRate),
  };

  const profile = await prisma.securityProfile.create({ data });

  return {
    message: "Security verification submitted successfully.",
    data: profile,
  };
}

const getAllSecurityProfiles = async () => {
  return prisma.securityProfile.findMany({
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          emailVerified: true,
        },
      },
    },
  });
}

const getSingleSecurityProfile = async (id: string) => {
  return prisma.securityProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          emailVerified: true,
        },
      },
    },
  });
};

export const SecurityService = {
  submitVerification,
  getAllSecurityProfiles,
  getSingleSecurityProfile
};
