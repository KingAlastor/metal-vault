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
  favorites_only?: boolean;
  favorite_genres_only?: boolean;
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

export async function getPostsByFilters(
  filters: PostsDataFilters,
  queryParams: QueryParamProps
): Promise<Post[]> {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    return [];
  }

  let favorites: string[] = [];
  let savedPosts: string[] = [];

  try {
    favorites = await fetchUserFavoriteBands();
    savedPosts = await fetchUserSavedPosts();
  } catch (error) {
    console.error("Error fetching user data:", error);
    return [];
  }

  let conditions: string[] = [];
  let params: any[] = [];

  if (filters?.favorites_only && favorites.length > 0) {
    conditions.push("band_id = ANY($1)");
    params.push(favorites);
  }

  if (filters?.favorite_genres_only) {
    try {
      const user = await sql`
        SELECT genre_tags
        FROM users
        WHERE id = ${session.userId}
      `;

      if (user[0]?.genre_tags?.length > 0) {
        conditions.push("genre_tags && $2");
        params.push(user[0].genre_tags);
      }
    } catch (error) {
      console.error("Error fetching user genres:", error);
      return [];
    }
  }

  try {
    const unfollowedBands = (await fetchUserUnfollowedBands()) || [];
    if (unfollowedBands.length > 0) {
      conditions.push("band_id != ALL($3)");
      params.push(unfollowedBands);
    }
  } catch (error) {
    console.error("Error fetching unfollowed bands:", error);
    return [];
  }

  try {
    const unfollowedUsers = (await fetchUnfollowedUsers(session.userId)) || [];
    if (unfollowedUsers.length > 0) {
      conditions.push("user_id != ALL($4)");
      params.push(unfollowedUsers);
    }
  } catch (error) {
    console.error("Error fetching unfollowed users:", error);
    return [];
  }

  const limitValue = queryParams.page_size + 1;
  let whereClause = "";

  if (conditions.length > 0 || queryParams.cursor) {
    whereClause = "WHERE ";
    const whereConditions: string[] = [];

    if (conditions.length > 0) {
      whereConditions.push(conditions.join(" AND "));
    }

    if (queryParams.cursor) {
      whereConditions.push(`post_date_time < ($${params.length + 1})::timestamp with time zone`);
      params.push(queryParams.cursor);
    }

    whereClause += whereConditions.join(" AND ");
  }

  const query = `
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
          'image', u.image,
          'role', u.role
        )
        FROM users u
        WHERE u.id = user_posts_active.user_id
      ) as user
    FROM user_posts_active
    ${whereClause}
    ORDER BY post_date_time DESC
    LIMIT ${limitValue}
  `;

  try {
    console.log("Executing query:", query);
    console.log("With params:", params);

    const posts = await sql.unsafe<UserPostsActive[]>(query, params);

    return posts.map((post: UserPostsActive) => ({
      ...post,
      is_favorite: favorites.includes(post.band_id || ""),
      is_saved: savedPosts.includes(post.id),
    })) as Post[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
      console.error("Query:", query);
      console.error("Params:", params);
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
  const tableName = `band_unfollowers${shard}`;
  const followersTableName = `band_followers_${shard}`;

  try {
    await sql`
      INSERT INTO ${sql.unsafe(tableName)} (user_id, band_id)
      VALUES (${session.userId}, ${bandId})
      ON CONFLICT (user_id, band_id) DO NOTHING
    `;

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
  field: string,
  value: string,
  comment: string
) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to report posts.");
  }

  try {
    await sql`
      INSERT INTO reported_posts (user_id, post_id, field, value, comment)
      VALUES (${session.userId}, ${postId}, ${field}, ${value}, ${comment})
    `;
  } catch (error) {
    console.error("Error reporting post:", error);
    throw error;
  }
}

export async function hideUserPostsForUserById(userId: string) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to hide user posts.");
  }

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
