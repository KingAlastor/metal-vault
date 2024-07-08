"use client"

import { ColumnDef } from "@tanstack/react-table"

export type BandAlbum = {
  bandId: string;
  bandName: string,
  albumName: string;
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
    accessorKey: "releaseDate",
    header: "Release Date",
    cell: ({ row }) => {
      const dateFull: string = row.getValue("releaseDate");
      const dateFormatted: string = new Date(dateFull).toLocaleDateString("en-GB");
      return <div>{dateFormatted}</div>;
    },
  },
]
