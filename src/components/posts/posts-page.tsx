"use client";

import { User } from "next-auth";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Loader2 } from "lucide-react";
import { getPostsByFilters } from "@/lib/data/posts/posts-data-actions";
import { getUserPostsFilters } from "@/lib/data/posts/posts-filters-data-actions";
import { PostsFiltersForm } from "./posts-filters-form";
import { Post, Posts } from "./posts";
import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";

interface PostsPageProps {
  user?: User;
}

export default function PostsPage({ user }: PostsPageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const query = useQuery<Post[]>({
    queryKey: ["post-feed"],
    queryFn: kyInstance.get("/api/posts").json<Post[]>,
  });

  const handleFilterChange = () => {};

  if (query.status === "pending")
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (query.status === "error") return <div>Error: {query.error.message}</div>;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2 mb-4"
      >
        <CollapsibleTrigger className="w-full rounded-lg border p-4 flex justify-between items-center bg-collapsible text-left">
          <span>Filters</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <PostsFiltersForm
            setIsOpen={setIsOpen}
            filters={filters}
            setFilters={setFilters}
          />
        </CollapsibleContent>
      </Collapsible>

      <Posts posts={query.data} />
    </div>
  );
}
