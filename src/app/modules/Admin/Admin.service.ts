import prisma from "../../../shared/prisma";

const approveSecurity = async (id: string) => {
  const profile = await prisma.securityProfile.findUnique({ where: { id } });
  if (!profile) throw new Error('Security profile not found');

  return prisma.securityProfile.update({
    where: { id },
    data: { approved: true },
  });
}
export const AdminService = {
  approveSecurity
};
