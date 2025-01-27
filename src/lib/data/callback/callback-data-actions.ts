"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const saveRefreshTokenToUserTokens = async (provider: string, token: string) => {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    throw new Error(
      "User ID is undefined. User must be logged in to access favorites."
    );
  }

  await prisma.userTokens.upsert({
    where: {
      userId_provider: {
        userId: user.id,
        provider: provider
      }
    },
    create: {
      userId: user.id,
      provider: provider,
      refreshToken: token,
    },
    update: {
      refreshToken: token,
    }
  });
}