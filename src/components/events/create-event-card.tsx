"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { CreateEventForm } from "./create-event-form";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger,DrawerHeader } from "../ui/drawer";
import useWindowSize from "@/lib/hooks/get-window-size";
import { useState } from "react";

export const CreateEventCard = () => {
  const size = useWindowSize();
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full space-y-2 mb-4">
      {size.width > 640 ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full rounded-lg border p-2 flex justify-start items-center bg-collapsible hover:bg-accent hover:text-accent-foreground"
              title="Create Post"
            >
              <Image src="/newPost.svg" alt="New Post" width={24} height={24} />
              <span className="hidden lg:inline ml-1">Create Event</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[528px]">
            <DialogHeader>
              <DialogTitle> Create Event</DialogTitle>
            </DialogHeader>
            <CreateEventForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <>
              <Button
                variant="ghost"
                className="w-full rounded-lg border p-2 flex justify-start items-center bg-collapsible hover:bg-accent hover:text-accent-foreground"
                title="Create Post"
              >
                <Image
                  src="/newPost.svg"
                  alt="New Post"
                  width={24}
                  height={24}
                />
                <span className="hidden lg:inline ml-1">Create Event</span>
              </Button>
            </>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Create Event</DrawerTitle>
            </DrawerHeader>
            <CreateEventForm setOpen={setOpen} />
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};
