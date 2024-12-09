"use client";

import { DataTable } from "./bands-data-table";
import { Band, columns } from "./bands-table-columns";
import { useEffect, useState } from "react";
import { fetchUserFavBandsFullData } from "@/lib/data/user/followArtists/follow-artists-data-actions";
import { BandSearchBar } from "@/components/shared/search-bands-dropdown";

export default function FollowArtistsPage() {
  const [bands, setBands] = useState<Band[]>([]);

  useEffect(() => {
    const getFavorites = async () => {
      const followedBands = await fetchUserFavBandsFullData();
      setBands(followedBands);
    };

    getFavorites();
  }, []);

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
