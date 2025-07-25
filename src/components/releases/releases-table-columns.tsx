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
import { followArtistByBandId } from "@/lib/data/follow-artists-data";
import { useSession } from "@/lib/session/client-hooks";

export type BandAlbum = {
  bandId: string;
  bandName: string;
  albumName: string;
  type: string | null;
  genreTags: string[];
  releaseDate: Date | null;
};

// Separate component for the actions dropdown
const ActionsDropdown = ({ bandAlbum }: { bandAlbum: BandAlbum }) => {
  const { data: session } = useSession();

  const handleAddToFavoritesClick = async () => {
    await followArtistByBandId(bandAlbum.bandId);
  };

  // Don't render if user is not logged in
  if (!session?.isLoggedIn) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleAddToFavoritesClick}>
          <div className="dropdown-options">Follow Artist</div>
        </DropdownMenuItem>
        {/* Add new item add album My albums */} 
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<BandAlbum>[] = [
  {
    accessorKey: "bandName",
    header: "Band",
    cell: ({ row }) => (
      <>
        <div className="hidden xs:block">{row.original.bandName}</div>
        <div className="block xs:hidden text-sm ml-2">
          {row.original.bandName}
          <div className="text-gray-500 ml-2">
            {row.original.albumName}
            <br />
            {getShortDate(row.original.releaseDate!)}
          </div>
        </div>
      </>
    ),
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
      return <>{dateFormatted}</>;
    },
  },  {
    id: "actions",
    cell: ({ row }) => {
      const bandAlbum = row.original;
      return <ActionsDropdown bandAlbum={bandAlbum} />;
    },
  },
];

const getFullDate = (date: Date) => {
  const d = formatDate(date);
  return `${d.month} ${d.day} ${d.year}`;
};

const getShortDate = (date: Date) => {
  const d = formatDate(date);
  return `${d.month} ${d.day}`;
};

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
  };
};
