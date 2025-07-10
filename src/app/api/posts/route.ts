import { Post } from "@/components/posts/post-types";
import { getAllPostsByFilters, PostsDataFilters } from "@/lib/data/posts-data";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session/server-actions";
import { getPostsFilterSettings } from "@/lib/data/user-data";

export type PostsPageData = {
  posts: Post[];
  next_cursor: string | null; 
  total_posts: number;
}

export async function GET(req: NextRequest) {
  try {
    console.log("Posts API - Fetching all posts with user filters");

    const session = await getSession();
    
    // Get filter settings from user's posts_settings (empty object if not logged in)
    const filters: PostsDataFilters = session.userId 
      ? await getPostsFilterSettings(session.userId)
      : {
          favorite_bands: false,
          disliked_bands: false,
          favorite_genres: false,
          disliked_genres: false,
        };
    
    console.log("Posts API - Using filters:", filters);
    
    // Get ALL filtered posts - client handles all pagination
    const allPosts = await getAllPostsByFilters(filters);

    console.log("Posts API - Response:", {
      totalPosts: allPosts.length,
    });

    const data: PostsPageData = {
      posts: allPosts,
      next_cursor: null, // Client handles pagination entirely
      total_posts: allPosts.length,
    };
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}