import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import Google from "next-auth/providers/google";
import {
  getUserCount,
  SQLWhere,
  CreateUserData,
  SignInUserData,
  updateSignInUserData,
  getUser,
  updateCreatedUserData,
} from "./lib/data/auth/auth-data-actions";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  events: {
    createUser: async ({ user }) => {
      // Calculate the shard value here
      const userCount = await getUserCount();
      const shard = Math.floor(userCount / 10000);

      // Update the user with the shard value
      const where: SQLWhere = { id: user.id! };
      const data: CreateUserData = {
        shard,
        role: "user",
        emailVerified: new Date(),
        accountCreated: new Date(),
        lastLogin: new Date(),
        pendingActions: ["firstLogin", "syncFollowers"],
      };
      await updateCreatedUserData(where, data);
    },
  },
  callbacks: {
    async signIn({ user }) {
      const where: SQLWhere = { id: user.id! };
      const existingUser = await getUser(where);
      if (existingUser) {
        const data: SignInUserData = { lastLogin: new Date() };
        await updateSignInUserData(where, data);
      }

      return true;
    },
    session({ session, user }) {
      session.user.role = user.role;
      session.user.postsSettings = user.postsSettings;
      session.user.notifications = user.notifications;
      session.user.releaseSettings = user.releaseSettings;
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [Google],
});
