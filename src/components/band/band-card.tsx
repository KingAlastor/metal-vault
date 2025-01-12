"use client";

import { getFullBandDataById } from "@/lib/data/bands/search-bands-data-actions";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

export const BandCard = () => {
  const pathname = usePathname();
  const bandId = pathname.split("/").pop();

  const { data: band, isError, error } = useQuery({
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

  return <div>
    <p>{band?.namePretty}</p>
    <p>{band?.country}</p>
    <p>{band?.genreTags}</p>
  </div>;
};
