import { Post } from "@/components/posts/post-types";
import { getPostsByFilters } from "@/lib/data/posts-data";
import { NextRequest, NextResponse } from "next/server";
import { getPostsFilters } from "@/lib/data/user-data";

export type PostsPageData = {
  posts: Post[];
  next_cursor: string | null; 
}

export async function GET(req: NextRequest) {
  try {

    const queryParams = {
      cursor: req.nextUrl.searchParams.get("cursor") || undefined,
      page_size: 5,
    };

    console.log("queryparams: ", queryParams)
    const userId = req.nextUrl.searchParams.get("user_id");
    const filters = userId ? await getPostsFilters(userId) : {};

    const posts = await getPostsByFilters(filters, queryParams);

    const next_cursor = posts.length > queryParams.page_size
    ? posts[queryParams.page_size - 1]?.post_date_time.toISOString()
    : null;

    const data: PostsPageData = {
      posts: posts.slice(0, queryParams.page_size), 
      next_cursor: next_cursor ? new Date(next_cursor).toISOString() : null, 
    };
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}