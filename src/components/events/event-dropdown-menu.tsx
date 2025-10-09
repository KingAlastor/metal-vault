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
import { DeleteEventDialog } from "./delete-event-dialog";
import { Event } from "./event-types";
import useWindowSize from "@/lib/hooks/get-window-size";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { CreateEventForm } from "./create-event-form";



export const EventDropdownMenu = (event: Event) => {
  const size = useWindowSize();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventFormgOpen] = useState(false);

  const handleAddToFavoritesClick = () => {};

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
            <div className="dropdown-options">Save event</div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddToFavoritesClick}>
            <div className="dropdown-options">Report event</div>
          </DropdownMenuItem>
          {event.is_owner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditEventFormgOpen(true)}>
                <div className="dropdown-options">Edit Event</div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                <div className="dropdown-options">Delete event</div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteEventDialog
        event={event}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
      {size.width > 640 ? (
        <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventFormgOpen}>
          <DialogContent className="sm:max-w-[528px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle> Edit Post</DialogTitle>
            </DialogHeader>
            <CreateEventForm setOpen={setIsEditEventFormgOpen} event={event} />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isEditEventOpen} onOpenChange={setIsEditEventFormgOpen}>
          <DrawerContent className="max-h-[90vh] overflow-y-auto">
            <DrawerHeader className="text-left">
              <DrawerTitle>Edit Post</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <CreateEventForm setOpen={setIsEditEventFormgOpen} event={event} />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};
