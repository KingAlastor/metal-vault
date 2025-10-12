"use server";

import sql from "../db";
import { getSession } from "../session/server-actions";
import { logUnauthorizedAccess } from "../loggers/auth-log";
import { checkFavoriteExists } from "./follow-artists-data";
import { fetchUserFavoriteBands } from "./follow-artists-data";
import { fetchUserUnfollowedBands } from "./unfollow-artists-data";
import { fetchUnfollowedUsers, fetchUserSavedPosts } from "./user-data";
import { UserPostsActive } from "../database-schema-types";
import { Post } from "@/components/posts/post-types";

export type PostProps = {
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

export type QueryParamProps = {
  cursor: string | undefined;
  page_size: number;
};

export type PostsDataFilters = {
  favorite_bands?: boolean;
  favorite_genres?: boolean;
  disliked_genres?: boolean;
};

export async function addOrUpdatePost(post: PostProps) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to create or update posts.");
  }

  try {
    let updatedPost;

    if (post.id) {
      updatedPost = await sql`
        UPDATE user_posts_active
        SET 
          band_id = ${post.bandId || null},
          band_name = ${post.band_name},
          title = ${post.title || null},
          genre_tags = ${post.genreTags},
          post_content = ${post.post_message || null},
          yt_link = ${post.yt_link || null},
          spotify_link = ${post.spotify_link || null},
          bandcamp_link = ${post.bandcamp_link || null},
          preview_url = ${post.previewUrl || null}
        WHERE id = ${post.id}
        RETURNING 
          id,
          user_id as "userId",
          band_id as "bandId",
          band_name as "bandName",
          title,
          genre_tags as "genreTags",
          post_content as "postContent",
          yt_link as "YTLink",
          spotify_link as "SpotifyLink",
          bandcamp_link as "BandCampLink",
          preview_url as "previewUrl",
          post_date_time as "postDateTime",
          (
            SELECT json_build_object(
              'name', u.name,
              'user_name', u.user_name,
              'image', u.image,
              'role', u.role
            )
            FROM users u
            WHERE u.id = user_posts_active.user_id
          ) as user
      `;
    } else {
      updatedPost = await sql`
        INSERT INTO user_posts_active (
          user_id,
          band_id,
          band_name,
          title,
          genre_tags,
          post_content,
          yt_link,
          spotify_link,
          bandcamp_link,
          preview_url,
          post_date_time
        ) VALUES (
          ${session.userId},
          ${post.bandId || null},
          ${post.band_name},
          ${post.title || null},
          ${post.genreTags},
          ${post.post_message || null},
          ${post.yt_link || null},
          ${post.spotify_link || null},
          ${post.bandcamp_link || null},
          ${post.previewUrl || null},
          NOW() AT TIME ZONE 'UTC'
        )
        RETURNING 
          id,
          user_id as "userId",
          band_id as "bandId",
          band_name as "bandName",
          title,
          genre_tags as "genreTags",
          post_content as "postContent",
          yt_link as "YTLink",
          spotify_link as "SpotifyLink",
          bandcamp_link as "BandCampLink",
          preview_url as "previewUrl",
          post_date_time as "postDateTime",
          (
            SELECT json_build_object(
              'name', u.name,
              'user_name', u.user_name,
              'image', u.image,
              'role', u.role
            )
            FROM users u
            WHERE u.id = user_posts_active.user_id
          ) as user
      `;
    }

    const isFav = await checkFavoriteExists(post.bandId);

    const result = {
      ...updatedPost[0],
      is_favorite: isFav,
      is_saved: false,
      user_id: updatedPost[0].userId,
      band_id: updatedPost[0].bandId,
      band_name: updatedPost[0].bandName,
      genre_tags: updatedPost[0].genreTags,
      post_content: updatedPost[0].postContent,
      yt_link: updatedPost[0].YTLink,
      spotify_link: updatedPost[0].SpotifyLink,
      bandcamp_link: updatedPost[0].BandCampLink,
      preview_url: updatedPost[0].previewUrl,
      post_date_time: updatedPost[0].postDateTime,
      user: updatedPost[0].user,
    } as Post;

    return result;
  } catch (error) {
    console.error("Error updating or creating post:", error);
    throw error;
  }
}

export async function deletePost(postId: string) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to delete posts.");
  }

  try {
    const deletedPost = await sql`
      DELETE FROM user_posts_active
      WHERE id = ${postId}
      RETURNING *
    `;

    return deletedPost[0];
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

export async function getAllPostsByFilters(
  filters: PostsDataFilters
): Promise<Post[]> {
  const session = await getSession();
  const isLoggedIn = session && session.userId && session.userShard != null;

  let followedBandIds: string[] = [];
  let userFavoriteGenreTags: string[] | undefined = [];
  let userDislikedGenreTags: string[] | undefined = [];
  let savedPosts: string[] = [];

  if (session.userId) {
    try {
      savedPosts = await fetchUserSavedPosts();
      followedBandIds = await fetchUserFavoriteBands();

      if (filters.favorite_genres || filters.disliked_genres) {
        const user = await sql`
          SELECT genre_tags, excluded_genre_tags
          FROM users
          WHERE id = ${session.userId}
        `;
        if (filters.favorite_genres) {
          userFavoriteGenreTags = user[0]?.genre_tags;
        }
        if (filters.disliked_genres) {
          userDislikedGenreTags = user[0]?.excluded_genre_tags;
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return [];
    }
  }

  try {
    // Use the same filtering logic as releases, but fetch ALL posts (limit 500)
    const posts = await sql`
      SELECT
        id,
        user_id,
        band_id,
        band_name,
        title,
        genre_tags,
        post_content,
        yt_link,
        spotify_link,
        bandcamp_link,
        preview_url,
        post_date_time,
        (
          SELECT json_build_object(
            'name', u.name,
            'user_name', u.user_name,
            'image', u.image
          )
          FROM users u
          WHERE u.id = user_posts_active.user_id
        ) as user
      FROM user_posts_active
      WHERE (
        -- Always exclude unfollowed users (highest priority exclusion)
        ${
          isLoggedIn
            ? sql`user_id NOT IN (
              SELECT unfollowed_user_id 
              FROM ${sql.unsafe(`user_unfollowers_${session.userShard}`)}
              WHERE user_id = ${session.userId}
          )`
            : sql`1=1`
        }
      )
      AND (
        -- Always exclude unfollowed bands (highest priority exclusion)
        ${
          isLoggedIn
            ? sql`band_id NOT IN (
              SELECT band_id 
              FROM ${sql.unsafe(`band_unfollowers_${session.userShard}`)}
              WHERE user_id = ${session.userId}
          )`
            : sql`1=1`
        }
      )
      ORDER BY post_date_time DESC
      LIMIT 500
    `;

    const followedBandsSet = new Set(followedBandIds);
    const savedPostsSet = new Set(savedPosts);
    const favoriteGenresSet = new Set(userFavoriteGenreTags || []);
    const dislikedGenresSet = new Set(userDislikedGenreTags || []);

    const filteredPosts: Post[] = [];

    for (const post of posts) {
      let shouldInclude = true;

      const isFavoriteBand = followedBandsSet.has(post.band_id);
      const isFavoriteGenre =
        post.genre_tags.some((tag: string) => favoriteGenresSet.has(tag)) ||
        false;
      const isDislikedGenre =
        post.genre_tags.some((tag: string) => dislikedGenresSet.has(tag)) ||
        false;

      if (filters.favorite_bands || filters.favorite_genres) {
        shouldInclude =
          (filters.favorite_bands && isFavoriteBand) ||
          (filters.favorite_genres && isFavoriteGenre);
      }

      if (
        filters.disliked_genres &&
        isDislikedGenre &&
        !(filters.favorite_bands && isFavoriteBand)
      ) {
        shouldInclude = false;
      }

      if (shouldInclude) {
        const is_owner = post.user_id === session.userId;
        const { user_id, ...cleanPost } = post;

        filteredPosts.push({
          ...cleanPost,
          is_favorite: followedBandsSet.has(post.band_id),
          is_saved: savedPostsSet.has(post.id),
          is_owner,
        } as Post);
      }
    }

    return filteredPosts;
  } catch (error) {
    console.error("Error fetching all posts:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    return [];
  }
}

export async function hideArtistForUserById(bandId: string) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to hide artists");
  }

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const unfollowersTableName = `band_unfollowers_${shard}`;
  const followersTableName = `band_followers_${shard}`;

  try {
    // Start a transaction
    await sql.begin(async (trx) => {
      // Add the band to the unfollowers table
      await trx.unsafe(
        `INSERT INTO ${unfollowersTableName} (user_id, band_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, band_id) DO NOTHING`,
        [session.userId!, bandId]
      );

      // Remove the band from the followers table
      await trx.unsafe(
        `DELETE FROM ${followersTableName}
         WHERE user_id = $1 AND band_id = $2`,
        [session.userId!, bandId]
      );
    });

    return { band_id: bandId };
  } catch (error) {
    console.error("Error hiding artist:", error);
    throw error;
  }
}

export async function addPostToSavedPosts(postId: string) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to save posts.");
  }

  try {
    await sql`
      INSERT INTO user_posts_saved (user_id, post_id)
      VALUES (${session.userId}, ${postId})
      ON CONFLICT (user_id, post_id) DO NOTHING
    `;
  } catch (error) {
    console.error("Error saving post:", error);
    throw error;
  }
}

export async function removePostFromSavedPosts(postId: string) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to unsave posts.");
  }

  try {
    await sql`
      DELETE FROM user_posts_saved
      WHERE user_id = ${session.userId} AND post_id = ${postId}
    `;
  } catch (error) {
    console.error("Error unsaving post:", error);
    throw error;
  }
}

export async function savePostReport(
  postId: string,
  field?: string,
  value?: string,
  comment?: string
) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to report posts.");
  }

  try {
    await sql`
      INSERT INTO reported_posts (user_id, post_id, field, value, comment)
      VALUES (${session.userId}, ${postId}, ${field || null}, ${
      value || null
    }, ${comment || null})
    `;
  } catch (error) {
    console.error("Error reporting post:", error);
    throw error;
  }
}

export async function hideUserPostsForUserById(postId: string) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to hide user posts.");
  }

  const userId = await getUserIdByPostId(postId);

  if (userId) {
    try {
      await sql`
      INSERT INTO user_unfollowers_${session.userId} (user_id, unfollowed_user_id)
      VALUES (${session.userId}, ${userId})
      ON CONFLICT (user_id, unfollowed_user_id) DO NOTHING
    `;

      return userId;
    } catch (error) {
      console.error("Error hiding user posts:", error);
      throw error;
    }
  }
}

async function getUserIdByPostId(postId: string) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to hide user posts.");
  }

  try {
    const [user] = await sql`
      SELECT user_id 
      FROM user_posts_active
      WHERE id = ${postId}
    `;

    if (user) {
      return user.user_id;
    } else {
      return null;
    }
  } catch (error) {}
}

export async function checkIfPostExists(bandId: string) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to hide user posts.");
  }

  try {
    const timeWindow = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

    const [post] = await sql`
      SELECT id 
      FROM user_posts_active
      WHERE band_id = ${bandId}
      AND post_date_time > ${timeWindow}
    `;

    if (post && post.id) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching band exists post:", error);
    throw error;
  }
}
