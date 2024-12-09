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
      <DataTable columns={columns} data={bands} />
    </div>
  );
}
