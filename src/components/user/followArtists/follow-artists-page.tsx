"use client";

import { DataTable } from "./bands-data-table";
import { Band, columns } from "./bands-table-columns";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bands,
  fetchBandsByFilters,
  fetchUserFavoriteBands,
  saveUserFavorites,
} from "@/lib/data/user/followArtists/follow-artists-data-actions";
import { BandSearchBar } from "@/components/shared/search-bands-dropdown";

export default function FollowArtistsPage() {
  const [bands, setBands] = useState<Band[]>([]);
  const [searchLetter, setSearchLetter] = useState("A");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const searchParams = useSearchParams();


  useEffect(() => {
    const getFavorites = async () => {
      let followedBands = [];
      followedBands = JSON.parse(localStorage.getItem("userFavorites") || "[]");
      if (followedBands.length === 0) {
        console.log("fetch bands from database due empty array");
        followedBands = await fetchUserFavoriteBands();
      }

      if (followedBands) {
        localStorage.setItem("userFavorites", JSON.stringify(followedBands));
      }
    };

    getFavorites();
  }, []);

  useEffect(() => {
    const fetchBands = async (search: string) => {
      console.log("fetching bands");
      const bands = await fetchBandsByFilters(search);
      setBands(bands);
      const followedBands = JSON.parse(
        localStorage.getItem("userFavorites") || "[]"
      );

      if (followedBands.length > 0) {
        const favorites = parseUserFavorites(bands, followedBands);
        setFavorites(favorites);
      }
    };
    fetchBands(searchLetter);
  }, [searchLetter]);

  useEffect(() => {
    const handlePageLeave = () => {
      const favorites = localStorage.getItem("userFavorites");
      if (favorites) {
        const favoritesArray = JSON.parse(favorites) as string[];
        saveUserFavorites(favoritesArray);
      } 
    };
  
    window.addEventListener("beforeunload", handlePageLeave);
  
    return () => {
      handlePageLeave();
      window.removeEventListener("beforeunload", handlePageLeave);
    };
  }, [searchParams]);

  return (
    <div>
      <BandSearchBar />
      <DataTable columns={columns} data={bands} favorites={favorites} />
    </div>
  );
}

const parseUserFavorites = (bands: Bands[], followedBands: Array<string>) => {
  let favorites: { [index: number]: boolean } = {};

  bands.forEach((band, index) => {
    if (followedBands.includes(band.id)) {
      favorites[index] = true;
    }
  });

  return favorites;
};
