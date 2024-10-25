"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
  const session = await auth();
  const userId = session?.user?.id;
  const filtersJson = JSON.stringify(filters);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      emailSettings: filtersJson,
    },
  });
}
 