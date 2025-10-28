"use client";

import { useState, useRef } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Loader2 } from "lucide-react";
import { PostsFiltersForm } from "./forms/posts-filters-form";
import { Posts } from "./post-cards";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { PostsPageData } from "@/app/api/posts/route";
import InfiniteScrollContainer from "../shared/infinite-scroll-container";
import { PostsLoadingSkeleton } from "./posts-loading-skeleton";
import Image from "next/image";
import { useUser } from "@/lib/session/client-hooks";
import { PostsDataFilters } from "@/lib/data/posts-data";
import { Post } from "./post-types";
import { CreatePostCard } from "./create-post-card";
import { useSessionContext } from "@/app/SessionProvider";

export default function PostsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { session: session } = useSessionContext();
  const fullUser = useUser(session?.userId || "");

  // Store all posts in a ref for client-side pagination
  const allPostsRef = useRef<Post[]>([]);
  const hasInitiallyFetchedRef = useRef(false);

  // Get current filters from user settings
  const filters: PostsDataFilters = fullUser.data?.posts_settings || {
    favorite_bands: false,
    favorite_genres: false,
    disliked_genres: false,
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["post-feed"],
    queryFn: async ({ pageParam }): Promise<PostsPageData> => {
      // If we already have all posts cached, paginate through them
      if (hasInitiallyFetchedRef.current && allPostsRef.current.length > 0) {
        const pageSize = 5;
        const startIndex = (pageParam as number) || 0;
        const endIndex = startIndex + pageSize;
        const postsPage = allPostsRef.current.slice(startIndex, endIndex);
        const next_cursor =
          endIndex < allPostsRef.current.length ? endIndex.toString() : null;

        return {
          posts: postsPage,
          next_cursor,
          total_posts: allPostsRef.current.length,
        };
      }

      const response = await kyInstance
        .get("/api/posts", {})
        .json<PostsPageData>();

      // Store all posts in our ref for future pagination
      allPostsRef.current = response.posts;
      hasInitiallyFetchedRef.current = true;

      // Return first page
      const pageSize = 5;
      const postsPage = response.posts.slice(0, pageSize);
      const next_cursor =
        pageSize < response.posts.length ? pageSize.toString() : null;

      return {
        posts: postsPage,
        next_cursor,
        total_posts: response.posts.length,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.next_cursor ? parseInt(lastPage.next_cursor) : undefined,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // Reset refs when query is invalidated (filter changes)
  if (status === "pending" && hasInitiallyFetchedRef.current) {
    hasInitiallyFetchedRef.current = false;
    allPostsRef.current = [];
  }

  const posts = data?.pages.flatMap((page) => page.posts) || [];
  const uniquePosts = [
    ...new Map(posts.map((post) => [post.id, post])).values(),
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <CreatePostCard />
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2 mb-4"
      >
        <CollapsibleTrigger className="w-full rounded-lg border p-2 flex items-center bg-collapsible text-left">
          <Image src="/Filters.svg" alt="New Event" width={24} height={24} />
          <span className="flex-1 ml-3">Filters</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <PostsFiltersForm setIsOpen={setIsOpen} />
        </CollapsibleContent>
      </Collapsible>

      {status === "pending" && <PostsLoadingSkeleton />}
      {status === "success" && !posts.length && !hasNextPage && (
        <p className="text-center text-muted-foreground">No posts found</p>
      )}
      {status === "error" && error instanceof Error && (
        <p className="text-center text-red-500">Error: {error.message}</p>
      )}

      {status === "success" && posts.length > 0 && (
        <InfiniteScrollContainer
          onBottomReached={() => {
            if (hasNextPage && !isFetching && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
        >
          <Posts posts={uniquePosts} />
          {isFetchingNextPage && (
            <Loader2 className="mx-auto my-3 animate-spin" />
          )}
        </InfiniteScrollContainer>
      )}
    </div>
  );
}
