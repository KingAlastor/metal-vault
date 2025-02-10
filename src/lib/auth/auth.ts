import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { getUserCount } from "../data/auth/auth-data-actions";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24,
    },
  },
  user: {
    additionalFields: {
      userName: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
      },
      location: {
        type: "string",
        required: false,
      },
      shard: {
        type: "number",
        required: true,
      },
      emailSettings: {
        type: "string",
        required: false,
      },
      postsSettings: {
        type: "string",
        required: false,
      },
      releaseSettings: {
        type: "string",
        required: false,
      },
      genreTags: {
        type: "string[]",
        required: false,
      },
      notifications: {
        type: "string[]",
        required: false,
      },
      pendingActions: {
        type: "string[]",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const userCount = await getUserCount();
          const shard = Math.floor(userCount / 10000);
          return {
            data: {
              ...user,
              role: "user",
              shard: shard,
              pendingActions: ["firstLogin", "syncFollowers"],
            },
          };
        },
      },
    },
  },
});

type Session = typeof auth.$Infer.Session;
