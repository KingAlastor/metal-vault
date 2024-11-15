"use client";

import { User } from "next-auth";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronDown } from "lucide-react";
import { getPostsByFilters } from "@/lib/data/posts/posts-data-actions";
import { getUserPostsFilters } from "@/lib/data/posts/posts-filters-data-actions";
import { PostsFiltersForm } from "./posts-filters-form";
import { Post, Posts } from "./posts";
import { unstable_cache } from "next/cache";

interface PostsPageProps {
  user?: User;
}

export default function PostsPage({ user }: PostsPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchUserFilters = async () => {
      if (user?.id) {
        let userFilters = await getUserPostsFilters(user.id!);
        setFilters(userFilters);
      }
    };
    fetchUserFilters();
  });

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await getPostsByFilters(filters);
      posts.sort(
        (b, a) => +new Date(a.postDateTime) - +new Date(b.postDateTime)
      );
      setPosts(posts);
    };

    fetchPosts();
  }, [filters]);

  return (
    <div>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-[800] space-y-2 mb-4"
      >
        <CollapsibleTrigger className="rounded-lg border p-4 w-full flex justify-between items-center bg-collapsible">
          Filters{" "}
          <div className="h-4 w-4">
            <ChevronDown />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <PostsFiltersForm
            setIsOpen={setIsOpen}
            filters={filters}
            setFilters={setFilters}
          />
        </CollapsibleContent>
      </Collapsible>

      <Posts posts={posts} />
    </div>
  );
}
