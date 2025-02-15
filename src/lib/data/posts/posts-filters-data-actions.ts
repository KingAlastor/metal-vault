"use server";

import { PostsDataFilters } from "@/components/posts/post-types";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export const getUserPostsFilters = async (id: string) => {
  const { user } =
  (await auth.api.getSession({ headers: await headers() })) ?? {};
  
  if (!user?.id) {
    throw new Error(
      "User ID is undefined."
    );
  }

  try {
    let filters; 
    const userFilters = await prisma.user.findUnique({
      select: {
        postsSettings: true,
      },
      where: { id },
    });
    
    if (userFilters?.postsSettings) {
      if (typeof userFilters.postsSettings === 'string') {
        filters = JSON.parse(userFilters.postsSettings);
      } 
    };
    return filters;   
  } catch {
    return null;
  }
};

export async function updatePostsProfileFilters(filters: PostsDataFilters) {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};
  
    if (!user?.id) {
      throw new Error(
        "User ID is undefined."
      );
    }

  const filtersJson = JSON.stringify(filters);

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        postsSettings: filtersJson,
      },
    });
  } catch (error) {
    console.error("Error updating user profile filters:", error);
  }
}