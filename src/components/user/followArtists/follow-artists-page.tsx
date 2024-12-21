"use client";

import { DataTable } from "./bands-data-table";
import { columns } from "./bands-table-columns";
import {
  checkBandExists,
  fetchUserFavBandsFullData,
  getRefreshTokenFromUserTokens,
  incrementBandFollowersValue,
  saveUserFavoriteAndUpdateFollowerCount,
} from "@/lib/data/user/followArtists/follow-artists-data-actions";
import { BandSearchBar } from "@/components/shared/search-bands-dropdown";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchEnvironmentVariables } from "@/lib/general/env-variables";
import { useEffect, useState } from "react";
import {
  Artist,
  getFollowedArtistsFromSpotify,
  refreshSpotifyAccessToken,
} from "@/lib/apis/Spotify-api";
import { UnresolvedBands } from "./unresolved-bands";

export default function FollowArtistsPage() {
  const queryClient = useQueryClient();

  const {
    data: bands,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["favbands"],
    queryFn: () => fetchUserFavBandsFullData(),
  });

  const [unresolvedBands, setUnresolvedBands] = useState<string[]>([]);
  const [isBandsDialogOpen, setIsBandsDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === "AUTH_COMPLETE") {
        setIsSyncing(true);
        const token = event.data.token;
        sessionStorage.setItem("spotify_access_token", token);
        const followedBands = await getFollowedArtistsFromSpotify(token);
        const unresolvedBands = await handleBandMapping(followedBands);
        setUnresolvedBands(unresolvedBands);
        setIsBandsDialogOpen(true);
        queryClient.invalidateQueries({ queryKey: ["favbands"] });
        setIsSyncing(false);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleSpotifyRedirect = async () => {
    setIsSyncing(true);
    const token = await handleSpotifyTokenRevalidation();
    const followedBands = await getFollowedArtistsFromSpotify(token);
    const unresolvedBands = await handleBandMapping(followedBands);
    setUnresolvedBands(unresolvedBands);
    setIsBandsDialogOpen(true);
    queryClient.invalidateQueries({ queryKey: ["favbands"] });
    setIsSyncing(false);
  };

  const handleDialogClose = () => {
    setIsBandsDialogOpen(false);
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
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
      <Button
        variant="outline"
        className="mt-4 mb-4 flex items-center justify-center"
        onClick={handleSpotifyRedirect}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : (
          <p>Sync from Spotify</p>
        )}
      </Button>
      <UnresolvedBands
        unresolvedBands={unresolvedBands}
        isOpen={isBandsDialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
}

const handleSpotifyTokenRevalidation = async () => {
  const refreshToken = await getRefreshTokenFromUserTokens("spotify");
  if (refreshToken) {
    const token = await refreshSpotifyAccessToken(refreshToken);
    return token;
  } else {
    const scope = await fetchEnvironmentVariables("SPOTIFY_SCOPE");
    const redirectUrl = await fetchEnvironmentVariables("SPOTIFY_REDIRECT_URL");
    const spotifyId = await fetchEnvironmentVariables("SPOTIFY_ID");
    const BASE_URL = "https://accounts.spotify.com/authorize";

    const authUrl = `${BASE_URL}?response_type=code&client_id=${spotifyId}&scope=${encodeURIComponent(
      scope
    )}&redirect_uri=${encodeURIComponent(redirectUrl)}`;
    window.open(authUrl, "Auth", "width=500,height=600");
  }
};

const handleBandMapping = async (followedBands: Artist[]) => {
  let unresolvedBands: string[] = [];
  for (let i = 0; i < followedBands.length; i++) {
    const bandId = await checkBandExists(followedBands[i].name);
    if (bandId) {
      await saveUserFavoriteAndUpdateFollowerCount(bandId);
    } else {
      unresolvedBands = [...unresolvedBands, followedBands[i].name];
    }
  }

  return unresolvedBands;
};
