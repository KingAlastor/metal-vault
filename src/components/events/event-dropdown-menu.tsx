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

export const EventDropdownMenu = (event : Event) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddToFavoritesClick = () => {
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
            <div className="dropdown-options">Save event</div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddToFavoritesClick}>
            <div className="dropdown-options">Report event</div>
          </DropdownMenuItem>
          {event.isUserOwner && (
            <>
              <DropdownMenuSeparator />
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
    </>
  );
};
