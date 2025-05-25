"use client";

import { Button } from "@/components/ui/button";
import useWindowSize from "@/lib/hooks/get-window-size";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";
import { CreatePostForm } from "@/components/posts/forms/create-post-form";
import { useSession } from "@/lib/session/client-hooks";
import { useRouter } from "next/navigation";

interface MenuBarProps {
  className?: string;
}

export default function MenuBar({ className }: MenuBarProps) {
  const size = useWindowSize();
  const [open, setOpen] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  const handleCreatePostClick = () => {
    // doesn't work
    if (!session?.userId) {
      router.push("/signin");
    } else {
      setOpen(true);
    }
  };

  return (
    <div className={className}>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Upcoming Releases"
        asChild
      >
        <Link href="/releases">
          <Image
            src="/Vinyl.svg"
            alt="Upcoming Release"
            width={24}
            height={24}
          />
          <span className="hidden lg:inline">Upcoming Releases</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Recommendations"
        asChild
      >
        <Link href="/recommendations">
          <Image
            src="/ThumbUp.svg"
            alt="Recommendations"
            width={24}
            height={24}
          />
          <span className="hidden lg:inline">Recommendations</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Events"
        asChild
      >
        <Link href="/events">
          <Image src="/Events.svg" alt="Events" width={24} height={24} />
          <span className="hidden lg:inline">Events</span>
        </Link>
      </Button>
      {size.width > 640 ? (
        <>
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-3 w-full"
            title="Create Post"
            onClick={handleCreatePostClick}
          >
            <Image src="/NewPost.svg" alt="New Post" width={24} height={24} />
            <span className="hidden lg:inline">Create Post</span>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Post</DialogTitle>
              </DialogHeader>
              <CreatePostForm setOpen={setOpen} />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-3 w-full"
            title="Create Post"
            onClick={handleCreatePostClick}
          >
            <Image src="/NewPost.svg" alt="New Post" width={24} height={24} />
            <span className="hidden lg:inline">Create Post</span>
          </Button>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Create Post</DrawerTitle>
              </DrawerHeader>
              <CreatePostForm setOpen={setOpen} />
            </DrawerContent>
          </Drawer>
        </>
      )}
    </div>
  );
}
