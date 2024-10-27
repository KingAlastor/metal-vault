"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type UserProfile = {
  userName?: string,
  country?: string,
}

export async function updateProfile(data: UserProfile) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw Error("Unauthorized");
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      userName: data.userName,
      location: data.country,
    },
  });

  revalidatePath("/");
}