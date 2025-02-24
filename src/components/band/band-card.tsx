"use client";

import { getFullBandDataById } from "@/lib/data/bands/search-bands-data-actions";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { Card } from "../ui/card";
import { AlbumList } from "./albums-collapsible";
import { Band } from "@/lib/database-schema-types";

export const BandCard = () => {
  const pathname = usePathname();
  const bandId = pathname.split("/").pop();

  const {
    data: band,
    isError,
    error,
  } = useQuery<Band, Error>({
    queryKey: ["band", bandId],
    queryFn: () => {
      if (typeof bandId !== "string" || !bandId) {
        throw new Error("Invalid bandId");
      }
      return getFullBandDataById(bandId);
    },
    enabled: !!bandId,
  });

  console.log("band data: ", band);
  if (isError) {
    return <>Error: {error.message}</>;
  }
  if (!band) {
    return <>Loading...</>;
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        <h2 className="text-center font-bold text-2xl">{band.name_pretty}</h2>
        <p>Country: {band.country}</p>
        <p>Genres: {band.genre_tags.join(", ")}</p>
        <p>Status: {band.status}</p>
        <p>Followers: {band.followers}</p>
        <p>Spotify: {band.spotify_id || "N/A"}</p>
        <AlbumList albums={band.albums || []} />
      </div>
    </Card>
  );
};
