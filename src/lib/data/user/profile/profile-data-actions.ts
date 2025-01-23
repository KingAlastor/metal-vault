"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type UpdateUser = {
  userName?: string;
  country?: string;
  genreTags?: string[];
  notifications?: string;
};

export async function updateUserData(data: UpdateUser) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw Error("Unauthorized");
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data,
  });

  revalidatePath("/");
}

export async function deleteUser() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw Error("Unauthorized");
  }

  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  } catch (error) {}
}

export async function deleteUserPendingAction(action: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw Error("Unauthorized");
  }
  
  await prisma.$executeRaw`
  UPDATE "users"
  SET "pending_actions" = array_remove(pending_actions, ${action})
  WHERE id = ${userId}
`;
}

