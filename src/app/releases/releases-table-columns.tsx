"use client"

import { ColumnDef } from "@tanstack/react-table"

export type BandAlbum = {
  id: string;
  bandId: string;
  albumName: string;
  releaseDate: Date;
  band: {
    namePretty: string;
  };
};

export const columns: ColumnDef<BandAlbum>[] = [
  {
    accessorFn: (row) => row.band.namePretty,
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
