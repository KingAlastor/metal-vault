"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export type EmailSettings = {
  preferred_email: string;
  email_frequency: string;
  favorite_bands?: boolean;
  favorite_genres?: boolean;
  follower_count?: number;
  events?: boolean;
  events_loc?: string;
};

export const getUserEmailSettings = async (id: string) => {
    const { user } =
      (await auth.api.getSession({ headers: await headers() })) ?? {};
    
  
    if (!user) {
      throw new Error(
        "User ID is undefined. User must be logged in to access favorites."
      );
    }

  try {
    let settings;
    const user = await prisma.user.findUnique({
      select: {

        emailSettings: true,
      },
      where: { id },
    });

    if (user?.emailSettings) {
      if (typeof user.emailSettings === "string") {
        settings = JSON.parse(user.emailSettings);
      }
    }
    return settings;
  } catch {
    return null;
  }
};


export async function updateProfileFilters(filters: EmailSettings) {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};
  

  if (!user) {
    throw new Error(
      "User ID is undefined."
    );
  }

  const filtersJson = JSON.stringify(filters);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailSettings: filtersJson,
    },
  });
}
 