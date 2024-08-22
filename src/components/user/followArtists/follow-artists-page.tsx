"use client";

import { DataTable } from "./bands-data-table";
import { Band, columns } from "./bands-table-columns";
import { useCallback, useEffect, useState } from "react";
import { fetchBandsByFilters } from "@/lib/data/user/followArtists/follow-artists-data-actions";
import { Input } from "@/components/ui/input";

export default function FollowArtistsPage() {
  const [bands, setBands] = useState<Band[]>([]);
  const [searchTerm, setSearchTerm] = useState("A");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const fetchBands = useCallback(async (search: string) => {
    if (search.length > 2) {
      const bands = await fetchBandsByFilters(search);
      const selectionPreset = filterFavoritesPresets(bands, userFavorites);

      console.log("fetch ran, length: ", bands.length);
      if (bands) {
        setBands(bands);
      }
      if (selectionPreset) {
        setRowSelection(selectionPreset);
      }
    } else {
      console.log("search too short: ", search);
      setBands([]);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchBands(searchTerm);
    }, 300);

    console.log("looping useEffect");

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchBands]);

  const saveSelectedRows = useCallback(async (rowSelection: string[]) => {
    const favorites = getUserFavorites(bands, rowSelection);
    await saveFavorites(favorites);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveSelectedRows(rowSelection);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [rowSelection, setRowSelection]);

  return (
    <div className="container mx-auto py-10">
      <Input
        placeholder="Search for a band..."
        onChange={(event) => setSearchTerm(event.target.value)}
        className="max-w-sm bg-black text-white mb-4"
      />

      <DataTable
        columns={columns}
        data={bands}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  );
}

const getUserFavorites = (bands: Band[], selectedRows: {}) => {
  return Object.keys(selectedRows).map((index) => bands[parseInt(index)].id);
};
