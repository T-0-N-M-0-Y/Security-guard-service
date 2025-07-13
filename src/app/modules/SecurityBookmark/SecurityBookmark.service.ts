import { Prisma } from "@prisma/client";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { userSearchAbleFields } from "../User/user.costant";

const addBookmarkIntoDb = async (userId: string, SecurityProfileId: string) => {
  const existing = await prisma.securityBookmark.findFirst({
    where: {
      userId,
      SecurityProfileId
    },
  });

  if (existing) {
    throw new Error('Already bookmarked');
  }

  return prisma.securityBookmark.create({
    data: { userId, SecurityProfileId }
  });
}

const getAllBookmarks = async (
  userId: string,
  searchTerm?: string,
  paginationOptions?: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(paginationOptions  || {});

  const andConditions: Prisma.SecurityBookmarkWhereInput[] = [];

  // 🔍 Filter by userId
  andConditions.push({ userId });

  // 🔍 Apply search term on related user fields
  if (searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map(field => ({
        security: {
          user: {
            [field]: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      })),
    });
  }

  const whereConditions: Prisma.SecurityBookmarkWhereInput = {
    AND: andConditions,
  };

  const result = await prisma.securityBookmark.findMany({
    where: whereConditions,
    include: {
      security: {
        include: {
          user: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.securityBookmark.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};


const removeBookmark = async (userId: string, SecurityProfileId: string) => {
  console.log(`Removing bookmark for user ${userId} and security profile ${SecurityProfileId}`);

  const existing = await prisma.securityBookmark.findFirst({
    where: {
      userId,
      SecurityProfileId
    },
  });
  return prisma.securityBookmark.delete({
    where: {
      id: existing?.id,
    },
  });
}

export const SecurityBookmarkService = {
  addBookmarkIntoDb,
  getAllBookmarks,
  removeBookmark,
};