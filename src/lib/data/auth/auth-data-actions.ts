import { prisma } from "@/lib/prisma";

export const getUserCount = async () => {
  const userCount = await prisma.user.count();
  return userCount;
};

export type SQLWhere = {
  id: string;
};

export type CreateUserData = {
  shard: number;
  role: string;
  emailVerified: Date;
  accountCreated: Date;
  lastLogin: Date;
};

export type SignInUserData = {
  lastLogin: Date;
};

export const updateCreatedUserData = async (
  where: SQLWhere,
  data: CreateUserData
) => {
  await prisma.user.update({
    where: where,
    data: data,
  });
};

export const updateSignInUserData = async (
  where: SQLWhere,
  data: SignInUserData
) => {
  await prisma.user.update({
    where: where,
    data: data,
  });
};

export const getUser = async (where: SQLWhere) => {
  const user = await prisma.user.findUnique({ where });
  return user;
};
