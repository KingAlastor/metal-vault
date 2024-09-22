"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    cell: ({ row }) => (
      <div>
        <div className="hidden xs:block">
          {row.original.bandName}
        </div>
        <div className="block xs:hidden text-sm ml-2">
          {row.original.bandName}
          <div className="text-gray-500 ml-2">
            {row.original.albumName}
            <br />
            {getShortDate(row.original.releaseDate!)}
          </div>
        </div>
      </div>
    )
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
      const dateFull: Date = row.getValue("releaseDate");
      const dateFormatted: string = getFullDate(dateFull);
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

const getFullDate = (date: Date) => {
  const d = formatDate(date);
  return `${d.month} ${d.day} ${d.year}`;
}

const getShortDate = (date: Date) => {
  const d = formatDate(date);
  return `${d.month} ${d.day}`;
}

const formatDate = (date: Date) => {
  const d = new Date(date);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return {
    day: d.getDate(),
    month: months[d.getMonth()],
    year: d.getFullYear(),
  }
};
