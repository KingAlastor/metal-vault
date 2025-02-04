import { Post } from "@/components/posts/post-types";
import { auth } from "@/lib/auth/auth";
import { getPostsByFilters } from "@/lib/data/posts/posts-data-actions";
import {
  getUserPostsFilters,
  PostsFilters,
} from "@/lib/data/posts/posts-filters-data-actions";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export type PostsPageData = {
  posts: Post[];
  nextCursor: string | null;
};

export async function GET(req: NextRequest) {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};
  try {
    const queryParams = {
      cursor: req.nextUrl.searchParams.get("cursor") || undefined,
      pageSize: 3,
    };

    let filters: PostsFilters = {};
    if (user?.id) {
      filters = await getUserPostsFilters(user.id);
    }

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
