import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import Google from "next-auth/providers/google";
import { getUserById } from "./lib/auth/getUser";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  events: {
    createUser: async ({ user }) => {
      // Calculate the shard value here
      const userCount = await prisma.user.count();
      const shard = userCount / 5000;

      // Update the user with the shard value
      await prisma.user.update({
        where: { id: user.id },
        data: { shard, role: "user", emailVerified: new Date() },
      });
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [Google],
});
