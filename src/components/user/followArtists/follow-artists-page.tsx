"use client";

import { DataTable } from "./bands-data-table";
import { getColumns } from "./bands-table-columns";
import {
  checkBandExists,
  fetchUserFavBandsFullData,
  getRefreshTokenFromUserTokens,
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
import { Band } from "@/lib/data/bands/search-bands-data-actions";
import { deleteUserPendingAction } from "@/lib/data/user/profile/profile-data-actions";
import { FirstTimeUserNotice } from "@/components/shared/first-time-user-notice";
import { useSession } from "@/lib/auth/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import kyInstance from "@/lib/ky";
import { DataTableBand } from "./follow-artists-types";

export default function FollowArtistsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [isFirstTimeUser, setIsFirstTimeUser] = useState(
    user?.pendingActions?.includes("syncFollowers") ?? false
  );

  const queryClient = useQueryClient();

  const {
    data: followedBands,
    status: favBandsStatus,
    error: favBandsError,
  } = useQuery({
    queryKey: ["favbands"],
    queryFn: () => kyInstance.get("/api/user/artists/followed").json<DataTableBand[]>(),
  });

  const {
    data: unfollowedBands,
    status: unfollowedBandsStatus,
    error: unfollowedBandsError,
  } = useQuery({
    queryKey: ["unfollowed-bands"],
    queryFn: () => kyInstance.get("/api/user/artists/unfollowed").json<DataTableBand[]>(),
  });

  const [unresolvedBands, setUnresolvedBands] = useState<string[]>([]);
  const [isBandsDialogOpen, setIsBandsDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const searchInputProps = {
    inputPlaceholder: "Search band from database...",
    clearInput: true,
  };

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
  }, [queryClient]);

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

  const handleBandSelect = async (band: Band) => {
    await saveUserFavoriteAndUpdateFollowerCount(band.bandId);
    queryClient.invalidateQueries({ queryKey: ["favbands"] });
  };

  const handleNoticeDismiss = async () => {
    await deleteUserPendingAction("syncFollowers");
    // Add updateSession
    // await updateSession();
    setIsFirstTimeUser(false);
  };

  return (
    <Tabs defaultValue="favorites">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="favorites">Favorite Bands</TabsTrigger>
        <TabsTrigger value="unfollowed">Unfollowed Bands</TabsTrigger>
      </TabsList>
      <TabsContent value="favorites">
        <>
          {isFirstTimeUser && (
            <FirstTimeUserNotice
              title="Welcome to Your favorite bands!"
              description="Search for your favorite bands from the database or synchronize from other providers like Spotify."
              onDismiss={handleNoticeDismiss}
            />
          )}
          <>
            <div className="mb-2">Add bands to favorites</div>
            <BandSearchBar
              searchInputProps={searchInputProps}
              onBandSelect={handleBandSelect}
            />
          </>

          {favBandsStatus === "pending" && (
            <div className="flex justify-center items-center h-screen">
              <Loader2 className="animate-spin" />
            </div>
          )}
          {favBandsStatus === "error" && (
            <> Error: {favBandsError?.message}</>
          )}

          <div className="rounded-lg border p-4 mt-4">
            <h2 className="text-lg font-bold">My Favorites</h2>
            <DataTable columns={getColumns('followed')}  data={followedBands || []} />
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
        </>
      </TabsContent>
      <TabsContent value="unfollowed">
        {unfollowedBandsStatus === "pending" && (
          <div className="flex justify-center items-center h-screen">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {unfollowedBandsStatus === "error" && (
          <> Error: {unfollowedBandsError?.message}</>
        )}

        <div className="rounded-lg border p-4 mt-4">
          <h2 className="text-lg font-bold">My Favorites</h2>
          <DataTable columns={getColumns('unfollowed')} data={unfollowedBands || []} />
        </div>
      </TabsContent>
    </Tabs>
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
    const popupWindow = window.open(authUrl, "Auth", "width=500,height=600");
    console.log("popup window: ", popupWindow);
    if (
      !popupWindow ||
      popupWindow.closed ||
      typeof popupWindow.closed == "undefined"
    ) {
      alert("Popup blocked. Please allow popups for this website.");
    }
  }
};

const handleBandMapping = async (followedBands: Artist[]) => {
  let unresolvedBands: string[] = [];
  for (let i = 0; i < followedBands.length; i++) {
    const bands = await checkBandExists(followedBands[i].name);
    if (bands.length === 1) {
      await saveUserFavoriteAndUpdateFollowerCount(bands[0].id);
    } else {
      unresolvedBands = [...unresolvedBands, followedBands[i].name];
    }
  }

  return unresolvedBands;
};
