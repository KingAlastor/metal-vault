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
import { CreatePostForm } from "@/components/posts/create-post-form";

interface MenuBarProps {
  className?: string;
}

export default function MenuBar({ className }: MenuBarProps) {
  const size = useWindowSize();
  const [open, setOpen] = useState(false);

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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-3 w-full"
              title="Create Post"
            >
              <Image src="/newPost.svg" alt="New Post" width={24} height={24} />
              <span className="hidden lg:inline">Create Post</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle> Create Post</DialogTitle>
            </DialogHeader>
            <CreatePostForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <>
              <Button
                variant="ghost"
                className="flex items-center justify-start gap-3 w-full"
                title="Create Post"
              >
                <Image
                  src="/newPost.svg"
                  alt="New Post"
                  width={24}
                  height={24}
                />
                <span className="hidden lg:inline">Create Post</span>
              </Button>
            </>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Create Post</DrawerTitle>
            </DrawerHeader>
            <CreatePostForm setOpen={setOpen} />
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
