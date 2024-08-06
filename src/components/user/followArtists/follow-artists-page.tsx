"use client";

import { User } from "next-auth";
import { DataTable } from "./bands-data-table";
import { Band, columns } from "./bands-table-columns";
import { useEffect, useState } from "react";
import { fetchBandsByFilters } from "@/lib/data/user/followArtists/follow-artists-data-actions";
import { Input } from "@/components/ui/input";

interface FollowArtistsPageProps {
  user: User;
}

export default function FollowArtistsPage({ user }: FollowArtistsPageProps) {
  const [bands, setBands] = useState<Band[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBands = async (search: string) => {
    if (search.length > 2) {
      const bands = await fetchBandsByFilters(searchTerm);
      console.log("fetch ran, length: ", bands.length);
      setBands(bands);
    } else {
      console.log("search too short: ", searchTerm);
      setBands([]);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchBands(searchTerm);
    }, 300);

    console.log("looping useEffect");

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  return (
    <div className="container mx-auto py-10">
      <Input
        placeholder="Search for a band..."
        onChange={(event) => setSearchTerm(event.target.value)}
        className="max-w-sm bg-black text-white mb-4"
      />

      <DataTable columns={columns} data={bands} />
    </div>
  );
}
