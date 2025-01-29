"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActionsCell from "./actions-cell";
import { DataTableBand } from "./follow-artists-types";

export function getColumns(listType: 'followed' | 'unfollowed'): ColumnDef<DataTableBand>[] {
  return [
    {
      accessorKey: "namePretty",
      header: "Name",
      cell: ({ row }) => (
        <a href={`/band/${row.original.id}`} className="block">
          <>{row.original.namePretty}</>
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Followers
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const followers: number = row.getValue("followers");
        return <div className="text-center">{followers}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ActionsCell bandId={row.original.id} listType={listType} />
      ),
    },
  ];
}