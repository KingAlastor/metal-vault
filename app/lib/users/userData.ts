import { PrismaClient } from '@prisma/client';

export interface User {
  userid: string;
  password: string | null;
  email: string | null;
  lastmodified: Date | null;
  added: Date | null;
}

// Instantiate PrismaClient outside of the function
const prisma = new PrismaClient();

export default async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.users.findUnique({
    where: {
      email: email
    }
  });

  return user;
}