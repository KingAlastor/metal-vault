"use client";

import { User } from "next-auth";
import prisma from "@/lib/prisma";
import { DataTable } from "./bands-data-table";
import { Band, columns } from "./bands-table-columns";

interface FollowArtistsPageProps {
  user: User;
}

export defaul function FollowArtistsPage({
  user,
}: FollowArtistsPageProps) {
  const bands: Band[] = await prisma.bands.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={bands} />
    </div>
  );
}
