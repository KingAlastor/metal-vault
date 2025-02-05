"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type FeedbackData = {
  title: string;
  comment: string;
};

export async function postUserFeedback(data: FeedbackData) {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error("User ID is undefined.");
  }

  await prisma.userFeedback.create({
    data: {
      userId: user.id,
      title: data.title,
      comment: data.comment,
    },
  });
}
