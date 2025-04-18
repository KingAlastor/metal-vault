"use client";

import { useState } from "react";
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

export default function PostsPage() {
  const [isOpen, setIsOpen] = useState(false);

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
    queryFn: async ({ pageParam }) => {
      const response = await kyInstance
        .get(
          "/api/posts",
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<PostsPageData>();
      return response;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const posts = data?.pages.flatMap((page: PostsPageData) => page.posts) || [];

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
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
          <Posts posts={posts} />
          {isFetchingNextPage && (
            <Loader2 className="mx-auto my-3 animate-spin" />
          )}
        </InfiniteScrollContainer>
      )}
    </div>
  );
}
