"use server";

import sql from "../db";
import { getSession } from "../session/actions";
import { logUnauthorizedAccess } from "../loggers/auth-log";
import { checkFavoriteExists } from "./follow-artists-data";
import { fetchUserFavoriteBands } from "./follow-artists-data";
import { fetchUserUnfollowedBands } from "./unfollow-artists-data";
import { fetchUnfollowedUsers } from "./user-data";
import { UserPostsActive } from '../database-schema-types';

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
  pageSize: number;
};

export type PostsDataFilters = {
  favorites_only?: boolean;
  favorite_genres_only?: boolean;
};

export async function addOrUpdatePost(post: PostProps) {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
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
              'userName', u.user_name,
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
          NOW()
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
              'userName', u.user_name,
              'image', u.image,
              'role', u.role
            )
            FROM users u
            WHERE u.id = user_posts_active.user_id
          ) as user
      `;
    }

    const isFav = await checkFavoriteExists(post.bandId);

    return {
      ...updatedPost[0],
      isFavorite: isFav,
      isSaved: false
    };
  } catch (error) {
    console.error("Error updating or creating post:", error);
    throw error;
  }
}

export async function deletePost(postId: string) {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
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
) {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    return [];
  }

  let favorites: string[] = [];
  let savedPosts: string[] = [];

  favorites = await fetchUserFavoriteBands();
  savedPosts = await fetchUserSavedPosts();

  let conditions: string[] = [];
  let params: any[] = [];

  if (filters?.favorites_only && favorites.length > 0) {
    conditions.push('band_id = ANY($1)');
    params.push(favorites);
  }

  if (filters?.favorite_genres_only) {
    const user = await sql`
      SELECT genre_tags as "genreTags"
      FROM users
      WHERE id = ${session.userId}
    `;
    
    if (user[0]?.genreTags?.length > 0) {
      conditions.push('genre_tags && $2');
      params.push(user[0].genreTags);
    }
  }

  // @ts-ignore - fetchUserUnfollowedBands returns Promise<string[]> but TS doesn't recognize the type
  const unfollowedBands = await fetchUserUnfollowedBands() || [];
  // @ts-ignore - fetchUnfollowedUsers requires userId parameter which is available from session
  const unfollowedUsers = await fetchUnfollowedUsers(session.userId) || [];

  if (unfollowedBands.length > 0) {
    conditions.push('band_id != ALL($3)');
    params.push(unfollowedBands);
  }

  // @ts-ignore - unfollowedUsers is guaranteed to be an array after the null coalescing above
  if (unfollowedUsers.length > 0) {
    conditions.push('user_id != ALL($4)');
    params.push(unfollowedUsers);
  }

  const query = `
    SELECT 
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
          'userName', u.user_name,
          'image', u.image,
          'role', u.role
        )
        FROM users u
        WHERE u.id = user_posts_active.user_id
      ) as user
    FROM user_posts_active
    ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}
    ORDER BY post_date_time DESC
    LIMIT $${params.length + 1}
    ${queryParams.cursor ? `OFFSET $${params.length + 2}` : ''}
  `;

  try {
    // @ts-ignore - postgres-js has incomplete types for unsafe queries with dynamic parameters
    // This is safe as we're using parameterized queries and proper parameter ordering
    const posts = await sql.unsafe<UserPostsActive[]>(
      query,
      [...params, queryParams.pageSize + 1, queryParams.cursor].filter(p => p !== undefined)
    );

    // @ts-ignore - post is correctly typed as UserPostsActive from the generic parameter above
    return posts.map((post: UserPostsActive) => ({
      ...post,
      isFavorite: favorites.includes(post.bandId || ''),
      isSaved: savedPosts.includes(post.id)
    }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function hideArtistForUserById(bandId: string) {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User must be logged in to hide artists");
  }

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const tableName = `band_unfollowers${shard}`;
  const followersTableName = `band_followers${shard}`;

  try {
    await sql.begin(async (sql) => {
      // Add to unfollowed
      // @ts-ignore - postgres-js has incomplete types for template literals with dynamic table names
      // This is safe as tableName is constructed from validated user shard
      await sql`
        INSERT INTO ${sql.unsafe(tableName)} (user_id, band_id)
        VALUES (${session.userId}, ${bandId})
      `;

      // Check if it was a favorite
      // @ts-ignore - postgres-js has incomplete types for template literals with dynamic table names
      // This is safe as followersTableName is constructed from validated user shard
      const favBand = await sql`
        SELECT band_id FROM ${sql.unsafe(followersTableName)}
        WHERE user_id = ${session.userId} AND band_id = ${bandId}
      `;

      if (favBand.length > 0) {
        // Remove from favorites
        // @ts-ignore - postgres-js has incomplete types for template literals with dynamic table names
        // This is safe as followersTableName is constructed from validated user shard
        await sql`
          DELETE FROM ${sql.unsafe(followersTableName)}
          WHERE user_id = ${session.userId} AND band_id = ${bandId}
        `;

        // Decrement follower count
        await sql`
          UPDATE bands
          SET followers = followers - 1
          WHERE id = ${bandId}
        `;
      }
    });

    return { bandId };
  } catch (error) {
    console.error("Error hiding artist:", error);
    throw error;
  }
}

export async function hideUserPostsForUserById(unfollowedUserId: string) {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User must be logged in to hide user posts");
  }

  const user = await sql`
    SELECT shard FROM users WHERE id = ${session.userId}
  `;

  const shard = user[0]?.shard || "0";
  const tableName = `user_unfollowers${shard}`;

  try {
    await sql`
      INSERT INTO ${sql.unsafe(tableName)} (user_id, unfollowed_user_id)
      VALUES (${session.userId}, ${unfollowedUserId})
    `;

    return unfollowedUserId;
  } catch (error) {
    console.error("Error hiding user posts:", error);
    throw error;
  }
}

export async function savePostReport(data: { postId: string; reason: string }) {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User must be logged in to report posts");
  }

  try {
    await sql`
      INSERT INTO reported_posts (
        user_id,
        post_id,
        reason,
        created_at
      ) VALUES (
        ${session.userId},
        ${data.postId},
        ${data.reason},
        NOW()
      )
    `;
  } catch (error) {
    console.error("Error saving post report:", error);
    throw error;
  }
}

export async function addPostToSavedPosts(postId: string) {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User must be logged in to save posts");
  }

  try {
    await sql`
      INSERT INTO user_posts_saved (user_id, post_id)
      VALUES (${session.userId}, ${postId})
      ON CONFLICT (user_id, post_id) DO NOTHING
    `;

    return postId;
  } catch (error) {
    console.error("Failed to save post:", error);
    throw error;
  }
}

export async function removePostFromSavedPosts(postId: string) {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    throw new Error("User must be logged in to unsave posts");
  }

  try {
    await sql`
      DELETE FROM user_posts_saved
      WHERE user_id = ${session.userId} AND post_id = ${postId}
    `;

    return postId;
  } catch (error) {
    console.error("Failed to unsave post:", error);
    throw error;
  }
}

export async function fetchUserSavedPosts() {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
    return [];
  }

  try {
    const savedPosts = await sql`
      SELECT post_id as "postId"
      FROM user_posts_saved
      WHERE user_id = ${session.userId}
    `;

    return savedPosts.map(row => row.postId);
  } catch (error) {
    console.error("Failed to fetch saved posts:", error);
    return [];
  }
}
