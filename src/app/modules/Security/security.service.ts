import { Request } from "express";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { ISecurityFilterRequest } from './security.interface';
import { fileUploader } from "../../../helpars/fileUploader";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";
import { userSearchAbleFields } from "../User/user.costant";

//Verification of security Profile
const submitVerification = async (req: Request) => {
  const userId = req.user.id;
  const payload = req.body.data;
  const file = req.file;
  let uploaded;
  let parseData;

  if (payload) {
    parseData = JSON.parse(payload);
  }

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid security user");
  }
  const existing = await prisma.securityProfile.findFirst({
    where: {
      userId: existingUser.id
    }
  });
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
    partTimeOrFullTime: parseData.partTimeOrFullTime
  };

  const profile = await prisma.securityProfile.create({ data });

  return {
    message: "Security verification submitted successfully.",
    data: profile,
  };
}

//Get all security Profile
const getAllSecurityProfiles = async (params: ISecurityFilterRequest,
  options: IPaginationOptions) => {

  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andCondions: Prisma.SecurityProfileWhereInput[] = [];

  if (params.searchTerm) {
    andCondions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditons: Prisma.SecurityProfileWhereInput = { AND: andCondions };

  const result = await prisma.securityProfile.findMany({
    where: whereConditons,
    skip,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
          [options.sortBy]: options.sortOrder,
        }
        : {
          createdAt: "desc",
        },
    select: {
      id: true,
      phoneNumber: true,
      address: true,
      govtId: true,
      hourlyRate: true,
      status: true,
      approved: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  const total = await prisma.securityProfile.count({
    where: whereConditons,
  });

  if (!result || result.length === 0) {
    throw new ApiError(404, "No Profile found");
  }
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
}

//Get single security Profile
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
