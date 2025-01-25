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
import { useState } from "react";
import { DeletePostDialog } from "./delete-post-dialog";
import { Post } from "./post-types";
import { CreatePostForm } from "./create-post-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import useWindowSize from "@/lib/hooks/get-window-size";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";

const PostDropdownMenu = (post: Post) => {
  const size = useWindowSize();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditPostOpen, setIsEditPostFormgOpen] = useState(false);

  const handleAddToFavoritesClick = () => {
    // Handle add click
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
          {post.isUserOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditPostFormgOpen(true)}>
                <div className="dropdown-options">Edit Post</div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                <div className="dropdown-options">Delete Post</div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DeletePostDialog
        post={post}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
      {size.width > 640 ? (
        <Dialog open={isEditPostOpen} onOpenChange={setIsEditPostFormgOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle> Edit Post</DialogTitle>
            </DialogHeader>
            <CreatePostForm setOpen={setIsEditPostFormgOpen} post={post}/>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isEditPostOpen} onOpenChange={setIsEditPostFormgOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Edit Post</DrawerTitle>
            </DrawerHeader>
            <CreatePostForm setOpen={setIsEditPostFormgOpen} post={post}/>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default PostDropdownMenu;
