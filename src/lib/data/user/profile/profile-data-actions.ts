"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type UpdateUser = {
  userName?: string;
  location?: string;
  genreTags?: string[];
  notifications?: string;
};

export async function updateUserData(data: UpdateUser) {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};
    
  if (!user) {
    throw new Error(
      "User ID is undefined."
    );
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data,
  });

  revalidatePath("/");
}

export async function deleteUser() {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};
  

  if (!user) {
    throw new Error(
      "User ID is undefined."
    );
  }

  try {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  } catch (error) {}
}

export async function deleteUserPendingAction(action: string) {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};
  

  if (!user) {
    throw new Error(
      "User ID is undefined."
    );
  }

  await prisma.$executeRaw`
  UPDATE "users"
  SET "pending_actions" = array_remove(pending_actions, ${action})
  WHERE id = ${user.id}
`;
}

