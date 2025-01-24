"use client";

import { getFullBandDataById } from "@/lib/data/bands/search-bands-data-actions";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { Card } from "../ui/card";

export const BandCard = () => {
  const pathname = usePathname();
  const bandId = pathname.split("/").pop();

  const {
    data: band,
    isError,
    error,
  } = useQuery({
    queryKey: ["band", bandId],
    queryFn: () => {
      if (typeof bandId !== "string" || !bandId) {
        throw new Error("Invalid bandId");
      }
      return getFullBandDataById(bandId);
    },
    enabled: !!bandId,
  });

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  if (!band) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <Card>
        <div className="p-3">
          <h2 className="text-center font-bold xxl-font">{band.namePretty}</h2>
          <p>Country: {band.country}</p>
          <p>Genre: {band.genreTags.join(", ")}</p>
          <p>Status: {band.status}</p>
          <p>Followers: {band.followers}</p>
          <p>Spotify: {band.spotifyId}</p>
        </div>
      </Card>
    </>
  );
};
