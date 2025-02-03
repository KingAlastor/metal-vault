"use server";

import { auth } from "@/lib/auth/auth";
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
import { headers } from "next/headers";

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
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

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
      isSaved: false,
    };

    return postWithFavourite;
  } catch (error) {
    console.error("Error updating or creating post:", error);
    throw error;
  }
};

export const deletePost = async (postId: string) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error(
      "User ID is undefined."
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
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};
  let where = {};
  let favorites: string[] = [];
  let savedPosts: string[] = [];

  if (user) {
    favorites = await fetchUserFavoriteBands();
    savedPosts = await fetchUserSavedPosts();
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
    isSaved: Array.isArray(savedPosts) && savedPosts.includes(record.id),
  }));

  return postsData;
};

export const hideArtistForUserById = async (bandId: string) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

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
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

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
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user?.id) {
    throw new Error(
      "User ID is undefined."
    );
  }

  const reportData = {
    userId: user.id,
    ...data,
  };

  await prisma.reportedPosts.create({
    data: reportData,
  });
}

export async function addPostToSavedPosts(postId: string) {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user?.id) {
    throw new Error(
      "User ID is undefined."
    );
  }

  try {
    await prisma.userPostsSaved.create({
      data: {
        userId: user.id,
        postId,
      },
    });

    return postId;
  } catch (error) {
    console.error("Failed to save post: ", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error code:", error.code);
    }
    throw error;
  }
}

export async function removePostFromSavedPosts(postId: string) {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user?.id) {
    throw new Error(
      "User ID is undefined."
    );
  }

  try {
    await prisma.userPostsSaved.delete({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });

    return postId;
  } catch (error) {
    console.error("Failed to unsave post: ", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error code:", error.code);
    }
    throw error;
  }
}

export async function fetchUserSavedPosts() {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user?.id) {
    throw new Error(
      "User ID is undefined."
    );
  }

  try {
    const savedPosts = await prisma.userPostsSaved.findMany({
      select: { postId: true },
      where: { userId: user.id },
    });

    const postIds = savedPosts.map((row: any) => row.postId);
    return postIds;
  } catch (error) {
    console.error("Failed to fetch posts: ", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error code:", error.code);
    }
    throw error;
  }
}

export async function updateProfileFilters(filters: PostsFilters) {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  const filtersJson = JSON.stringify(filters);

  if (!user?.id) {
    throw new Error(
      "User ID is undefined."
    );
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      postsSettings: filtersJson,
    },
  });
}
