import { auth } from "@/auth";
import { Post } from "@/components/posts/posts";
import { getPostsByFilters } from "@/lib/data/posts/posts-data-actions";
import { NextRequest } from "next/server";

export type PostsPageData = {
  posts: Post[];
  nextCursor: string | null;
};

export async function GET(req: NextRequest) {
  try {
    const queryParams = {
      cursor: req.nextUrl.searchParams.get("cursor") || undefined,
      pageSize: 3,
    };
    
    const session = await auth();
    const user = session?.user;
    console.log("user", user);
    
    const filters = {};

    const posts: Post[] = await getPostsByFilters(filters, queryParams);

    const nextCursor =
      posts.length > queryParams.pageSize
        ? posts[queryParams.pageSize].id
        : null;

    const data: PostsPageData = {
      posts: posts.slice(0, queryParams.pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
