"use client";

import { DataTable } from "./bands-data-table";
import { columns } from "./bands-table-columns";
import { fetchUserFavBandsFullData } from "@/lib/data/user/followArtists/follow-artists-data-actions";
import { BandSearchBar } from "@/components/shared/search-bands-dropdown";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchEnvironmentVariables } from "@/lib/general/env-variables";
import { useEffect, useState } from "react";

export default function FollowArtistsPage() {
  const {
    data: bands,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["favbands"],
    queryFn: () => fetchUserFavBandsFullData(),
  });

  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "AUTH_COMPLETE") {
        setHasToken(true);
        console.log("handle message event fired");
        // You can also store the token in your application state if needed
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleSpotifyRedirect = async () => {
    const scope = await fetchEnvironmentVariables("SPOTIFY_SCOPE");
    const redirectUrl = await fetchEnvironmentVariables("SPOTIFY_REDIRECT_URL");
    const spotifyId = await fetchEnvironmentVariables("SPOTIFY_ID");

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${spotifyId}&scope=${encodeURIComponent(
      scope
    )}&redirect_uri=${encodeURIComponent(redirectUrl)}`;
    window.open(authUrl, "Auth", "width=500,height=600");
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 />
      </div>
    );
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <BandSearchBar />
      <div className="rounded-lg border p-4 mt-4">
        <h2 className="text-lg font-bold mb-4">My Favorites</h2>
        <DataTable columns={columns} data={bands} />
      </div>
      <Button onClick={handleSpotifyRedirect}>
        <p>Sync from Spotify</p>
      </Button>
    </div>
  );
}
