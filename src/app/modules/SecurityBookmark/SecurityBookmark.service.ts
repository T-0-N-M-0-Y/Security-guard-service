import prisma from "../../../shared/prisma";

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

const getAllBookmarks = async (userId: string) => {
  return prisma.securityBookmark.findMany({
    where: { userId },
    include: {
      security: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}


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