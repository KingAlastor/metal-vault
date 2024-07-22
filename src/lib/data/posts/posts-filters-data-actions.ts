import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type PostsFilters = {
  favorites_only?: boolean;
  favorite_genres_only?: boolean;
};


export const getUserPostsFilters = async (id: string) => {
  try {
    let filters; 
    const userFilters = await prisma.user.findUnique({
      select: {
        releaseSettings: true,
      },
      where: { id },
    });
    
    if (userFilters?.releaseSettings) {
      console.log("releasePage", userFilters.releaseSettings);
      if (typeof userFilters.releaseSettings === 'string') {
        filters = JSON.parse(userFilters.releaseSettings);
      } 
    };
    return filters;   
  } catch {
    return null;
  }
};

export async function updateProfileFilters(filters: PostsFilters) {
  const session = await auth();
  const userId = session?.user?.id;
  const filtersJson = JSON.stringify(filters);

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        releaseSettings: filtersJson,
      },
    });
  } catch (error) {
    console.error("Error updating user profile filters:", error);
  }
}