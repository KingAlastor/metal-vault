"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { followArtistByBandId } from "../../lib/data/releases/releases-data-actions";

export type BandAlbum = {
  bandId: string;
  bandName: string;
  albumName: string;
  type: string | null;
  genreTags: string[];
  releaseDate: Date | null;
};

export const columns: ColumnDef<BandAlbum>[] = [
  {
    accessorKey: "bandName",
    header: "Band",
  },
  {
    accessorKey: "albumName",
    header: "Album",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "genreTags",
    header: "Genres",
  },
  {
    accessorKey: "releaseDate",
    header: "Release Date",
    cell: ({ row }) => {
      const dateFull: string = row.getValue("releaseDate");
      const dateFormatted: string = new Date(dateFull).toLocaleDateString(
        "en-GB"
      );
      return <div>{dateFormatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const bandAlbum = row.original;

      const handleAddToFavoritesClick = async () => {
        await followArtistByBandId(bandAlbum.bandId);
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleAddToFavoritesClick}>
              <div className="dropdown-options">Follow Artist</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];