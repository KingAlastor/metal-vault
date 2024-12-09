"use client";

import { DataTable } from "./bands-data-table";
import { columns } from "./bands-table-columns";
import { fetchUserFavBandsFullData } from "@/lib/data/user/followArtists/follow-artists-data-actions";
import { BandSearchBar } from "@/components/shared/search-bands-dropdown";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function FollowArtistsPage() {
  const {
    data: bands,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["favbands"],
    queryFn: () => fetchUserFavBandsFullData(),
  });

  if (isLoading)
    return (
      <div>
        <Loader2 />
      </div>
    );
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <BandSearchBar />
      <div className="rounded-lg border p-4 mt-4">
        <h2 className="text-lg font-bold mb-4">My Favorites</h2>
        <DataTable columns={columns} data={bands} />
      </div>
    </div>
  );
}
