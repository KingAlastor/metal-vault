"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const saveRefreshTokenToUserTokens = async (
  provider: string,
  token: string
) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user?.id) {
    throw new Error(
      "User ID is undefined."
    );
  }

  await prisma.userTokens.upsert({
    where: {
      userId_provider: {
        userId: user.id,
        provider: provider,
      },
    },
    create: {
      userId: user.id,
      provider: provider,
      refreshToken: token,
    },
    update: {
      refreshToken: token,
    },
  });
};
