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
import { CreatePostForm } from "./forms/create-post-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import useWindowSize from "@/lib/hooks/get-window-size";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { useHideArtistPostMutation } from "./hooks/use-hide-artist-posts-mutation";
import { useSession } from "next-auth/react";
import { useFollowArtistPostMutation } from "./hooks/use-follow-artist-mutation";
import { useUnFollowArtistPostMutation } from "./hooks/use-unfollow-artist-mutation";
import { useUnFollowUserPostMutation } from "./hooks/use-unfollow-user-posts-mutation";
import { ReportPostForm } from "./forms/report-post-form";
import { useSavePostMutation } from "./hooks/use-save-post-mutation";
import { useUnSavePostMutation } from "./hooks/use-unsave-post-mutation";

const PostDropdownMenu = (post: Post) => {
  const { data: session } = useSession();
  const size = useWindowSize();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditPostOpen, setIsEditPostFormOpen] = useState(false);
  const [isReportPostOpen, setIsReportPostOpen] = useState(false);

  const hideMutation = useHideArtistPostMutation();
  const followMutation = useFollowArtistPostMutation();
  const unfollowMutation = useUnFollowArtistPostMutation();
  const unfollowUserMutation = useUnFollowUserPostMutation();
  const savePostMutation = useSavePostMutation();
  const unsavePostMutation = useUnSavePostMutation();

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
          <DropdownMenuItem
            onClick={() =>
              post.isFavorite
                ? post.bandId && unfollowMutation.mutate(post.bandId)
                : post.bandId && followMutation.mutate(post.bandId)
            }
            disabled={followMutation.isPending || unfollowMutation.isPending}
          >
            <div className="dropdown-options">
              {post.isFavorite
                ? unfollowMutation.isPending
                  ? "Unfollowing..."
                  : "Unfollow artist"
                : followMutation.isPending
                ? "Following..."
                : "Follow artist"}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => post.bandId && hideMutation.mutate(post.bandId)}
            disabled={hideMutation.isPending}
          >
            <div className="dropdown-options">
              {hideMutation.isPending ? "Hiding..." : "Hide artist"}
            </div>
          </DropdownMenuItem>
          {post.userId != session?.user.id && (
            <>
              <DropdownMenuItem
                onClick={() => unfollowUserMutation.mutate(post.userId)}
              >
                <div className="dropdown-options">Hide user</div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  post.isSaved
                    ? unsavePostMutation.mutate(post.id)
                    : savePostMutation.mutate(post.id)
                }
                disabled={
                  savePostMutation.isPending || unsavePostMutation.isPending
                }
              >
                <div className="dropdown-options">
                  {post.isSaved
                    ? unsavePostMutation.isPending
                      ? "Unsaving..."
                      : "Unsave Post"
                    : savePostMutation.isPending
                    ? "Saving..."
                    : "Save Post"}
                </div>
              </DropdownMenuItem>
            </>
          )}
          {post.userId === session?.user.id && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditPostFormOpen(true)}>
                <div className="dropdown-options">Edit Post</div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                <div className="dropdown-options">Delete Post</div>
              </DropdownMenuItem>
            </>
          )}
          {post.userId != session?.user.id && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsReportPostOpen(true)}>
                <div className="dropdown-options">Report Post</div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DeletePostDialog
        post={post}
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
      {size.width > 640 ? (
        <>
          <Dialog open={isEditPostOpen} onOpenChange={setIsEditPostFormOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle> Edit Post</DialogTitle>
              </DialogHeader>
              <CreatePostForm setOpen={setIsEditPostFormOpen} post={post} />
            </DialogContent>
          </Dialog>

          <Dialog open={isReportPostOpen} onOpenChange={setIsReportPostOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle> Report Post</DialogTitle>
              </DialogHeader>
              <ReportPostForm
                setIsOpen={setIsReportPostOpen}
                postId={post.id}
              />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <Drawer open={isEditPostOpen} onOpenChange={setIsEditPostFormOpen}>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Edit Post</DrawerTitle>
              </DrawerHeader>
              <CreatePostForm setOpen={setIsEditPostFormOpen} post={post} />
            </DrawerContent>
          </Drawer>

          <Drawer open={isReportPostOpen} onOpenChange={setIsEditPostFormOpen}>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Report Post</DrawerTitle>
              </DrawerHeader>
              <ReportPostForm
                setIsOpen={setIsReportPostOpen}
                postId={post.id}
              />
            </DrawerContent>
          </Drawer>
        </>
      )}
    </>
  );
};

export default PostDropdownMenu;
