import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

//global is not affected by hot reload
export const prisma = globalThis.prisma || new PrismaClient();

export default prisma;

//if we're in development, let's set the global prisma object
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

