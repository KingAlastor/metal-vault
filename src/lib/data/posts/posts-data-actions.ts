"use server";

import { auth } from "@/auth";
import { PrismaUserPostsModel } from "../../../../prisma/models";
import { prisma } from "@/lib/prisma";

type PostProps = {
  band_name?: string,
  bandId?: string,
  genre?: string,
  post_message: string,
  yt_link?: string,
  spotify_link?: string,
  bandcamp_link?: string, 
}

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
    const newPost = await model.create({
      data: {
        userId: user.id,
        bandId: post.bandId,
        bandName: post.band_name,
        genre: post.genre,
        postContent: post.post_message,
        YTLink: post.yt_link,
        SpotifyLink: post.spotify_link,
        BandCampLink: post.bandcamp_link,
      },
    });

    return newPost;
  } catch (error) {
    console.error("Error updating bands table data:", error);
  }
};
