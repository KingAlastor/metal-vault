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

  useEffect(() => {
    const getFavorites = async () => {
      const favorites = await getUserFavorites();
    }

    getFavorites();
  }, []);


  const fetchBands = useCallback(async (search: string) => {
      const bands = await fetchBandsByFilters(search);
//      const selectionPreset = filterFavoritesPresets(bands, userFavorites);

      if (bands) {
        setBands(bands);
      }
/*       if (selectionPreset) {
        setRowSelection(selectionPreset);
      } */
  }, []);

  useEffect(() => {
      fetchBands(searchTerm);

    console.log("looping useEffect");
  }, [searchTerm, fetchBands]);

  const saveSelectedRows = useCallback(async (rowSelection: string[]) => {
    const favorites = getUserFavorites(bands, rowSelection);
    await saveFavorites(favorites);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      /* saveSelectedRows(rowSelection); */
      updateUserFavorites()
    };
    console.log("row selection useeffect triggered");
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [rowSelection, setRowSelection]);

  return (
    <div className="container mx-auto py-10">

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
