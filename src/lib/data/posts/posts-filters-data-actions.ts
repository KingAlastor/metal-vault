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
        postsSettings: true,
      },
      where: { id },
    });
    
    if (userFilters?.postsSettings) {
      console.log("postSettings: ", userFilters.postsSettings);
      if (typeof userFilters.postsSettings === 'string') {
        filters = JSON.parse(userFilters.postsSettings);
      } 
    };
    return filters;   
  } catch {
    return null;
  }
};

export async function updatePostsProfileFilters(filters: PostsFilters) {
  const session = await auth();
  const userId = session?.user?.id;
  const filtersJson = JSON.stringify(filters);

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        postsSettings: filtersJson,
      },
    });
  } catch (error) {
    console.error("Error updating user profile filters:", error);
  }
}