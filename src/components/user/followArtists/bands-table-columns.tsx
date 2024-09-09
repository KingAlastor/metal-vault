"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Band {
  id: string;
  namePretty: string;
  genreTags: string[];
  country: string | null;
  status: string | null;
  followers: number | null;
}

const handleCheckedChange = (row: any, value: string | boolean) => {
  row.toggleSelected(!!value);
  const id = row.original.id;
  let updatedFavorites = [];

  const favorites = JSON.parse(localStorage.getItem("userFavorites") || "[]");
  if (value) {
    updatedFavorites = [...favorites, id];
  } else {
    updatedFavorites = favorites.filter((bandId: string) => bandId !== id);
  }
  localStorage.setItem("userFavorites", JSON.stringify(updatedFavorites));
};

export const columns: ColumnDef<Band>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-white"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => handleCheckedChange(row, value)}
        aria-label="Select row"
        className="border-white"
      />
    ),
  },
  {
    accessorKey: "namePretty",
    header: "Name",
    cell: ({ row }) => (
      <a href={`/band/${row.original.namePretty}`} className="block">
        <div className="font-bold">{row.original.namePretty}</div>
        <div className="block xs:hidden text-sm text-gray-500 ml-2">
          {row.original.country}
        </div>
      </a>
    ),
  },
  {
    accessorKey: "genreTags",
    header: "Genre",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "followers",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Followers
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const followers: number = row.getValue("followers");

      return <div className="text-center">{followers}</div>;
    },
  },
];
