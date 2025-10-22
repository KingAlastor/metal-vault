"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerHeader,
  DrawerTrigger,
} from "../ui/drawer";
import useWindowSize from "@/lib/hooks/get-window-size";
import { useState } from "react";
import { CreatePostForm } from "./forms/create-post-form";
import { useSession } from "@/lib/session/client-hooks";
import { useRouter } from "next/navigation";

export const CreatePostCard = () => {
  const size = useWindowSize();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleCreatePostClick = () => {
    if (!session?.userId) {
      router.push("/signin");
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="w-full space-y-2 mb-4">
      {size.width > 640 ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full rounded-lg border p-2 flex justify-start items-center bg-collapsible hover:bg-accent hover:text-accent-foreground"
              title="Create Post"
              onClick={handleCreatePostClick}
            >
              <Image src="/NewPost.svg" alt="New Post" width={24} height={24} />
              <span className="ml-1">Create Post</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[528px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle> Create Post</DialogTitle>
            </DialogHeader>
            <CreatePostForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              className="w-full rounded-lg border p-2 flex justify-start items-center bg-collapsible hover:bg-accent hover:text-accent-foreground"
              title="Create Post"
              onClick={handleCreatePostClick}
            >
              <Image
                src="/newPost.svg"
                alt="New Event"
                width={24}
                height={24}
              />
              <span className="ml-1">Create Post</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[90vh] overflow-y-auto">
            <DrawerHeader className="text-left">
              <DrawerTitle>Create Post</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <CreatePostForm setOpen={setOpen} />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};
