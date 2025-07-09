import { Request } from "express";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { fileUploader } from "../../../helpars/fileUploader";


const submitVerification = async (req: Request) => {
  const userId = req.user.id;
  const payload = req.body.data;
  const file = req.file;
  let uploaded;
  let parseData;

if(payload) {
    parseData = JSON.parse(payload);
  }

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid security user");
  }
  const existing = await prisma.securityProfile.findFirst({ where: { 
    userId: existingUser.id } });
  if (existing) throw new ApiError(httpStatus.BAD_REQUEST, "Verification already submitted");


  // Upload certificate to DigitalOcean
 if (file) {
   const res = await fileUploader.uploadToDigitalOcean(file)
   uploaded = res.Location
 }
  // Create the security profile
  const data = {
    userId: userId,
    phoneNumber: parseData.phoneNumber,
    address: parseData.permanentAddress,
    govtId: parseData.govtId,
    securityCertificate: uploaded,
    dateOfBirth: new Date(parseData.dateOfBirth),
    about: parseData.about,
    hourlyRate: Number(parseData.hourlyRate),
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
