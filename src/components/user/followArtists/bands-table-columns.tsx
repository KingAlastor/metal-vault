"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActionsCell from "./actions-cell";

export interface Band {
  id: string;
  namePretty: string;
  genreTags: string[];
  country: string | null;
  status: string | null;
  followers: number | null;
}

export const columns: ColumnDef<Band>[] = [
  {
    accessorKey: "namePretty",
    header: "Name",
    cell: ({ row }) => (
      <a href={`/band/${row.original.id}`} className="block">
        <div>{row.original.namePretty}</div>
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
  {
    id: "actions",
    cell: ({ row }) => {
      return <ActionsCell bandId={row.original.id} />;
    },
  },
];
