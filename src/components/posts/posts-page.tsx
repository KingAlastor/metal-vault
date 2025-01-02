"use client";

import { User } from "next-auth";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { getPostsByFilters } from "@/lib/data/posts/posts-data-actions";
import { getUserPostsFilters } from "@/lib/data/posts/posts-filters-data-actions";
import { PostsFiltersForm } from "./posts-filters-form";
import { Post, Posts } from "./posts";

interface PostsPageProps {
  user?: User;
}

export default function PostsPage({ user }: PostsPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchUserFilters = async () => {
      console.log("fetch user filters", user);
      if (user?.id) {
        let userFilters = await getUserPostsFilters(user.id!);
        console.log("set user filters: ", userFilters);
        setFilters(userFilters);
      }
    };
    fetchUserFilters();
  }, [user]);

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await getPostsByFilters(filters);
      setPosts(posts as Post[]);
    };

    fetchPosts();
  }, [filters]);

  const handleFilterChange = () => {};

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

      <Posts posts={posts} />
    </div>
  );
}
