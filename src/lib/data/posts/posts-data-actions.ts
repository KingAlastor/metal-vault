"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PostsFilters } from "./posts-filters-data-actions";
import { User } from "next-auth";

type PostProps = {
  band_name: string;
  bandId?: string | null;
  title?: string;
  genreTags: string[];
  post_message?: string;
  yt_link?: string;
  spotify_link?: string;
  bandcamp_link?: string;
  previewUrl?: string;
};

type QueryParamProps = {
  cursor: string | undefined;
  pageSize: number;
};

export const addPost = async (post: PostProps) => {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    throw new Error(
      "User ID is undefined. User must be logged in to access favorites."
    );
  }

  try {
    const newPost = await prisma.userPostsActive.create({
      data: {
        userId: user!.id!,
        bandId: post.bandId,
        bandName: post.band_name,
        title: post.title,
        genreTags: post.genreTags,
        postContent: post.post_message,
        YTLink: post.yt_link,
        SpotifyLink: post.spotify_link,
        BandCampLink: post.bandcamp_link,
        previewUrl: post.previewUrl,
      },
      include: { user: true },
    });

    return newPost;
  } catch (error) {
    console.error("Error updating bands table data:", error);
    throw error;
  }
};

type PostFilters = {
  genres?: string[];
};

export const deletePost = async (postId: string, user: User) => {
  if (!user) {
    throw new Error(
      "User ID is undefined. User must be logged in to access favorites."
    );
  }

  try {
    const deletePost = await prisma.userPostsActive.delete({
      where: {
        id: postId,
      },
    });
  } catch (error) {
    console.error("Error updating bands table data:", error);
    throw error;
  }
};

export const getPostsByFilters = async (
  filters: any,
  queryParams: QueryParamProps
) => {
  const session = await auth();
  const user = session?.user;

  const posts = await prisma.userPostsActive.findMany({
    select: {
      id: true,
      userId: true,
      bandId: true,
      bandName: true,
      title: true,
      genreTags: true,
      postContent: true,
      YTLink: true,
      SpotifyLink: true,
      BandCampLink: true,
      previewUrl: true,
      postDateTime: true,
      user: {
        select: {
          name: true,
          userName: true,
          image: true,
          role: true,
        },
      },
    },
    orderBy: { postDateTime: "desc" },
    take: queryParams.pageSize + 1,
    cursor: queryParams.cursor ? { id: queryParams.cursor } : undefined,
  });

  return posts;
};

export async function updateProfileFilters(filters: PostsFilters) {
  const session = await auth();
  const userId = session?.user?.id;
  const filtersJson = JSON.stringify(filters);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      postsSettings: filtersJson,
    },
  });
}
