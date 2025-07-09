import prisma from "../../../shared/prisma";

const approveSecurity = async (userId: string) => {

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) throw new Error('User not found');

  const profile = await prisma.securityProfile.findUnique({ where: { userId: existingUser.id } });
  if (!profile) throw new Error('Security profile not found');

  return prisma.securityProfile.update({
    where: { userId: existingUser.id },
    data: { approved: true, status: 'APPROVED' },
  });
}

export const AdminService = {
  approveSecurity
};
