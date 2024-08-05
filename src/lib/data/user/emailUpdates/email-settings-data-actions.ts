"use server";

import { prisma } from "@/lib/prisma";

export type EmailSettings = {
  preferred_email?: string;
  email_frequency: 'W' | 'M';
  favorites?: boolean;
  genres?: string[];
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
      console.log("releasePage", user.emailSettings);
      if (typeof user.emailSettings === "string") {
        settings = JSON.parse(user.emailSettings);
      }
    }
    return settings;
  } catch {
    return null;
  }
};
 