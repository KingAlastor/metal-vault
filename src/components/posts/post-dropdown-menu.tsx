"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Post } from "./posts";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { DeletePostDialog } from "./delete-post-dialog";

type PostDropdownMenuProps = {
  post: Post;
};

const PostDropdownMenu = ({ post }: PostDropdownMenuProps) => {
  const { data, status } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddToFavoritesClick = () => {
    console.log("clicked");
  };

  return (
    <>
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
          <DropdownMenuSeparator />
          {status === "authenticated" && post.userId === data.user.id && (
            <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
              <div className="dropdown-options">Delete Post</div>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeletePostDialog
        post={post}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};

export default PostDropdownMenu;
