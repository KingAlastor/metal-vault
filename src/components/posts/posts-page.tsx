"use client";

import { User } from "next-auth";
import { useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ChevronDown } from "lucide-react";
import { getPostsByFilters } from "@/lib/data/posts/posts-data-actions";
import { getUserPostsFilters } from "@/lib/data/posts/posts-filters-data-actions";
import { PostsFiltersForm } from "./posts-filters-form";
import { Posts, PostsProps } from "./posts";

interface PostsPageProps {
  user?: User;
}

/* type Posts = {
  band_name?: string,
  bandId?: string,
  genre?: string,
  post_message: string,
  yt_link?: string,
  spotify_link?: string,
  bandcamp_link?: string, 
  postDateTime: Date,
} */

export default function PostsPage({ user }: PostsPageProps) {
  const [posts, setPosts] = useState<PostsProps[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchUserFilters = async () => {
      if (user?.id) {
        let userFilters = await getUserPostsFilters(user.id!);
        setFilters(userFilters);
      }
      fetchUserFilters();
    };
  });

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await getPostsByFilters(filters);
      posts.sort((b, a) => +new Date(a.postDateTime) - +new Date(b.postDateTime));
      setPosts(posts);
    };

    fetchPosts();
  }, [filters]);

  return (
    <div className="container mx-auto py-10">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2 mb-4"
      >
        <CollapsibleTrigger className="rounded-lg border p-4 w-full flex justify-between items-center text-white">
          Filters{" "}
          <div className="h-4 w-4">
            <ChevronDown />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="text-white">
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