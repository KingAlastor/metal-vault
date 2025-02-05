import { prisma } from "@/lib/prisma";

export const getUserCount = async () => {
  const userCount = await prisma.user.count();
  return userCount;
};
