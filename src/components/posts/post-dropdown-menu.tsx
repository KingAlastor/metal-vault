"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { deletePost } from "@/lib/data/posts/posts-data-actions";
import { Post } from "./posts";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

type PostDropdownMenuProps = {
  post: Post;
};

const PostDropdownMenu = ({ post }: PostDropdownMenuProps) => {
  const { data, status } = useSession();
  const pathname = usePathname();

  const handleAddToFavoritesClick = () => {
    console.log("clicked");
  };

    const handleDeletePostClick = async () => {
      const result = await deletePost(post.id, data!.user);
      if (pathname === "/") {
        window.location.reload();
      }
    };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleAddToFavoritesClick}>
          <div className="dropdown-options">Save post</div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAddToFavoritesClick}>
          <div className="dropdown-options">Report Post</div>
        </DropdownMenuItem>
        {status === "authenticated" && post.userId === data.user.id && (
          <DropdownMenuItem onClick={handleDeletePostClick}>
            <div className="dropdown-options">Delete Post</div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostDropdownMenu;
