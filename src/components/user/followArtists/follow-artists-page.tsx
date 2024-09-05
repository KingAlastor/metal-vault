"use client";

import { DataTable } from "./bands-data-table";
import { Band, columns } from "./bands-table-columns";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bands,
  fetchBandsByFilters,
  fetchUserFavoriteBands,
  saveUserFavorites,
} from "@/lib/data/user/followArtists/follow-artists-data-actions";

export default function FollowArtistsPage() {
  const [bands, setBands] = useState<Band[]>([]);
  const [searchLetter, setSearchLetter] = useState("A");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  useEffect(() => {
    const getFavorites = async () => {
      let followedBands = [];
      followedBands = JSON.parse(localStorage.getItem("userFavorites") || "[]");
      if (followedBands.length === 0) {
        console.log("fetch bands from database due empty array");
        followedBands = await fetchUserFavoriteBands();
      }
      console.log("db fetch: ", followedBands);
      if (followedBands) {
        localStorage.setItem("userFavorites", JSON.stringify(followedBands));
      }
    };

    getFavorites();
  }, []);

  useEffect(() => {
    const fetchBands = async (search: string) => {
      const bands = await fetchBandsByFilters(search);
      setBands(bands);
      const followedBands = JSON.parse(
        localStorage.getItem("userFavorites") || "[]"
      );
      console.log("followed bands:", followedBands);
      if (followedBands) {
        const favorites = parseUserFavorites(bands, followedBands);
        console.log("preselect favorites: ", favorites);
        setFavorites(favorites);
      }
    };
    fetchBands(searchLetter);
    console.log("looping useEffect");
  }, [searchLetter]);

  useEffect(() => {
    const handlePageLeave = () => {
      console.log("beforeunload event triggered", pathname);
      const favorites = localStorage.getItem("userFavorites");
      if (favorites) {
        console.log("handle page leave", favorites);
        const favoritesArray = JSON.parse(favorites) as string[];
        saveUserFavorites(favoritesArray);
      } else {
        console.log("No favorites found in local storage");
      }
    };
  
    console.log("row selection useEffect triggered");
    window.addEventListener("beforeunload", handlePageLeave);
  
    return () => {
      console.log("Cleaning up beforeunload event listener");
      window.removeEventListener("beforeunload", handlePageLeave);
    };
  }, [pathname]);

  return (
    <div className="container mx-auto py-10">
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
