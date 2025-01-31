"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PostsFilters } from "./posts-filters-data-actions";
import {
  checkFavoriteExists,
  fetchUserFavoriteBands,
} from "../user/followArtists/follow-artists-data-actions";
import { Prisma } from "@prisma/client";
import { fetchUserUnfollowedBands } from "../user/followArtists/unfollow-artists-data-actions";
import { PrismaUserUnFollowersModel } from "../../../../prisma/models";
import { fetchUnfollowedUsers } from "../user/user-data-actions";
import { ReportedPostData } from "@/components/posts/forms/post-form-types";

type PostProps = {
  id?: string;
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

export const addOrUpdatePost = async (post: PostProps) => {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    throw new Error("User ID is undefined.");
  }

  try {
    let updatedPost;

    if (post.id) {
      updatedPost = await prisma.userPostsActive.update({
        where: { id: post.id },
        data: {
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
    } else {
      updatedPost = await prisma.userPostsActive.create({
        data: {
          userId: user.id,
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
    }

    const isFav = await checkFavoriteExists(post.bandId);

    const postWithFavourite = {
      ...updatedPost,
      isFavorite: isFav,
    };

    return postWithFavourite;
  } catch (error) {
    console.error("Error updating or creating post:", error);
    throw error;
  }
};

export const deletePost = async (postId: string) => {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    throw new Error(
      "User ID is undefined. User must be logged in to access favorites."
    );
  }

  try {
    const deletedPost = await prisma.userPostsActive.delete({
      where: {
        id: postId,
      },
    });

    return deletedPost;
  } catch (error) {
    console.error("Error updating bands table data:", error);
    throw error;
  }
};

type PostFilters = {
  favorites_only?: boolean;
  favorite_genres_only?: boolean;
};

export const getPostsByFilters = async (
  filters: PostFilters,
  queryParams: QueryParamProps
) => {
  const session = await auth();
  const user = session?.user;
  let where = {};
  let favorites: string[] = [];
  if (user) {
    favorites = await fetchUserFavoriteBands();
  }

  if (filters?.favorites_only) {
    if (favorites.length > 0)
      where = {
        ...where,
        bandId: {
          in: favorites,
        },
      };
  }

  if (filters?.favorite_genres_only && user?.genreTags) {
    where = {
      ...where,
      genreTags: {
        hasSome: user.genreTags,
      },
    };
  }

  if (user) {
    const unfollowedBands = await fetchUserUnfollowedBands();
    const unfollowedUsers = await fetchUnfollowedUsers();

    if (unfollowedBands.length > 0) {
      where = {
        ...where,
        bandId: {
          notIn: unfollowedBands,
        },
      };
    }

    if (unfollowedUsers.length > 0) {
      where = {
        ...where,
        userId: {
          notIn: unfollowedUsers,
        },
      };
    }
  }

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
    where: where,
    orderBy: { postDateTime: "desc" },
    take: queryParams.pageSize + 1,
    cursor: queryParams.cursor ? { id: queryParams.cursor } : undefined,
  });

  const postsData = posts.map((record) => ({
    ...record,
    isFavorite:
      Array.isArray(favorites) && record.bandId
        ? favorites.includes(record.bandId)
        : false,
  }));
  
  return postsData;
};

export const hideArtistForUserById = async (bandId: string) => {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || user?.shard === undefined || user?.shard === null) {
    throw new Error("User must be logged in to hide artists");
  }

  const shard = user.shard;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`INSERT INTO band_unfollowers_${Prisma.raw(
        shard.toString()
      )} (user_id, band_id) VALUES (${user.id}, ${bandId})`;

      const favBand =
        await tx.$queryRaw`SELECT band_id FROM band_followers_${Prisma.raw(
          shard.toString()
        )} WHERE user_id = ${user.id} AND band_id = ${bandId}`;
      if (
        Array.isArray(favBand) &&
        favBand.length > 0 &&
        favBand[0].band_id === bandId
      ) {
        await tx.$executeRaw`DELETE FROM band_followers_${Prisma.raw(
          shard.toString()
        )} WHERE user_id = ${user.id} AND band_id = ${bandId}`;

        await tx.$executeRaw`UPDATE bands SET followers = followers - 1 WHERE id = ${bandId}`;
      }
    });
    return { bandId };
  } catch (error) {
    console.error("Error hiding artist:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error code:", error.code);
    }
    throw error;
  }
};

export const hideUserPostsForUserById = async (unfollowedUserId: string) => {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || user?.shard === undefined) {
    throw new Error("User must be logged in to access unfollowed bands.");
  }

  const shard = user.shard.toString();
  const modelName = `userUnFollowers${shard}` as const;

  if (!(modelName in prisma)) {
    throw new Error(`Model ${modelName} does not exist in Prisma client.`);
  }

  const model = prisma[
    modelName as keyof typeof prisma
  ] as PrismaUserUnFollowersModel;

  try {
    await model.create({
      data: {
        userId: user.id,
        unfollowedUserId,
      },
    });

    return unfollowedUserId;
  } catch (error) {
    console.error("Error fetching unfollowed bands:", error);
    throw error;
  }
};

export async function savePostReport(data: ReportedPostData) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    throw new Error(
      "User ID is undefined. User must be logged in to access favorites."
    );
  }

  const reportData = {
    userId: userId,
    ...data,
  }

  await prisma.reportedPosts.create({
    data: reportData
  })
}

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
