"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteFavorite } from "./hooks/use-delete-favorite-band";
import { useDeleteUnfollowedBand } from "./hooks/use-delete-unfollow-band";

interface ActionsCellProps {
  bandId: string;
  listType: 'followed' | 'unfollowed';
}

const ActionsCell: React.FC<ActionsCellProps> = ({ bandId, listType }) => {
  const { handleDeleteFavoritesClick } = useDeleteFavorite();
  const { handleDeleteUnFollowBandClick } = useDeleteUnfollowedBand();

  const actionConfig = {
    followed: {
      label: 'Unfollow Artist',
      action: () => {
        console.log('Unfollowing artist with bandId:', bandId);
        handleDeleteFavoritesClick(bandId);
      }
    },
    unfollowed: {
      label: 'Remove Unfollow',
      action: () => {
        console.log('Removing unfollow for bandId:', bandId);
        handleDeleteUnFollowBandClick(bandId);
      }
    }
  };

  const { label, action } = actionConfig[listType];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={action}>
          <div className="dropdown-options">{label}</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionsCell;