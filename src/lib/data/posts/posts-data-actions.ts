"use server";

import { auth } from "@/auth";
import { PrismaUserPostsModel } from "../../../../prisma/models";
import { prisma } from "@/lib/prisma";
import { MaxTableShards } from "@/lib/enums";
import { PostsFilters } from "./posts-filters-data-actions";
import { User } from "next-auth";

type PostProps = {
  band_name?: string;
  bandId?: string;
  title?: string; 
  genre?: string;
  post_message?: string;
  yt_link?: string;
  spotify_link?: string;
  bandcamp_link?: string;
  previewUrl?: string;
};

export const addPost = async (post: PostProps) => {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    throw new Error(
      "User ID is undefined. User must be logged in to access favorites."
    );
  }

  const shard =
    user.shard && prisma[`userPosts${user.shard}` as keyof typeof prisma]
      ? user.shard
      : "0";
  const model = prisma[
    `userPosts${shard}` as keyof typeof prisma
  ] as PrismaUserPostsModel;

  try {
    await model.create({
      data: {
        userId: user.id,
        bandId: post.bandId,
        bandName: post.band_name,
        title: post.title, 
        genreTags: post.genre,
        postContent: post.post_message,
        YTLink: post.yt_link,
        SpotifyLink: post.spotify_link,
        BandCampLink: post.bandcamp_link,
        previewUrl: post.previewUrl,
      },
    });
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
  
  const shard =
    user.shard && prisma[`userPosts${user.shard}` as keyof typeof prisma]
      ? user.shard
      : "0";
  const model = prisma[
    `userPosts${shard}` as keyof typeof prisma
  ] as PrismaUserPostsModel;

  try {
    const deletePost = await model.delete({
      where: {
        id: postId,
      },
    });
  } catch (error) {
    console.error("Error updating bands table data:", error);
    throw error;
  }
};

export const getPostsByFilters = async (filters: PostFilters) => {
  const session = await auth();
  const user = session?.user;

  let allPosts = [];

  for (
    let shardSuffix = 0;
    shardSuffix < MaxTableShards.UserPosts;
    shardSuffix++
  ) {
    const model = prisma[
      `userPosts${shardSuffix}` as keyof typeof prisma
    ] as PrismaUserPostsModel;

    const posts = await model.findMany({
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
    });
    if (posts.length > 0) {
      allPosts.push(...posts);
    }
  }

  return allPosts;
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
