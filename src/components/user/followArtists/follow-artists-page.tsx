"use client";

import { DataTable } from "./bands-data-table";
import { getColumns } from "./bands-table-columns";
import {
  checkBandExists,
  saveUserFavoriteAndUpdateFollowerCount,
} from "@/lib/data/follow-artists-data";
import { BandSearchBar } from "@/components/shared/search-bands-dropdown";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchEnvironmentVariables } from "@/lib/general/env-variables";
import { useEffect, useMemo, useState } from "react";
import {
  Artist,
  getFollowedArtistsFromSpotify,
  refreshSpotifyAccessToken,
} from "@/lib/apis/Spotify-api";
import { UnresolvedBands } from "./unresolved-bands";
import { FirstTimeUserNotice } from "@/components/shared/first-time-user-notice";
import { useSession, useUser } from "@/lib/session/client-hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import kyInstance from "@/lib/ky";
import { DataTableBand } from "./follow-artists-types";
import { useChangeBandRating } from "./hooks/use-change-band-rating";
import { SearchTermBand } from "@/lib/data/bands-data";
import { deleteUserPendingAction, getRefreshTokenFromUserTokens, updateUserData } from "@/lib/data/user-data";

export default function FollowArtistsPage() {
  const { data: session } = useSession();
  const user = useUser(session?.userId);

  const [isFirstTimeUser, setIsFirstTimeUser] = useState(
    user?.data?.pending_actions?.includes("syncFollowers") ?? false
  );

  const queryClient = useQueryClient();
  const { mutate: changeRating } = useChangeBandRating();

  const {
    data: followedBands,
    status: favBandsStatus,
    error: favBandsError,
  } = useQuery({
    queryKey: ["favbands"],
    queryFn: () =>
      kyInstance.get("/api/user/artists/followed").json<DataTableBand[]>(),
  });

  const {
    data: unfollowedBands,
    status: unfollowedBandsStatus,
    error: unfollowedBandsError,
  } = useQuery({
    queryKey: ["unfollowed-bands"],
    queryFn: () =>
      kyInstance.get("/api/user/artists/unfollowed").json<DataTableBand[]>(),
  });

  const followedColumns = useMemo(
    () => getColumns("followed", changeRating),
    [changeRating]
  );

  const unfollowedColumns = useMemo(
    () => getColumns("unfollowed", () => {}),
    []
  );

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
        try {
          const token = event.data.token;
          sessionStorage.setItem("spotify_access_token", token);
          const followedBands = await getFollowedArtistsFromSpotify(token);
          const unresolvedBands = await handleBandMapping(followedBands);
          setUnresolvedBands(unresolvedBands);
          setIsBandsDialogOpen(true);
          queryClient.invalidateQueries({ queryKey: ["favbands"] });
        } catch (error) {
          console.error("Error during Spotify sync:", error);
          alert("Failed to sync with Spotify. Please try again.");
        } finally {
          setIsSyncing(false);
        }
      } else if (event.data.type === "AUTH_ERROR") {
        setIsSyncing(false);
        console.error("Spotify auth error:", event.data.error);
        alert("Spotify authentication failed. Please try again.");
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [queryClient]);
  const handleSpotifyRedirect = async () => {
    setIsSyncing(true);
    try {
      const token = await handleSpotifyTokenRevalidation();
      
      // If we got a token directly (from refresh token), process it
      if (token) {
        const followedBands = await getFollowedArtistsFromSpotify(token);
        const unresolvedBands = await handleBandMapping(followedBands);
        setUnresolvedBands(unresolvedBands);
        setIsBandsDialogOpen(true);
        queryClient.invalidateQueries({ queryKey: ["favbands"] });
        setIsSyncing(false);
      }
      // If no token returned, it means popup auth is in progress
      // The message handler will handle the rest when popup sends the token
    } catch (error) {
      console.error("Error during Spotify redirect:", error);
      alert("Failed to connect to Spotify. Please try again.");
      setIsSyncing(false);
    }
  };

  const handleDialogClose = () => {
    setIsBandsDialogOpen(false);
  };

  const handleBandSelect = async (band: SearchTermBand) => {
    await saveUserFavoriteAndUpdateFollowerCount(band.bandId);
    queryClient.invalidateQueries({ queryKey: ["favbands"] });
  };

  const handleNoticeDismiss = async () => {
    await deleteUserPendingAction("syncFollowers");
    const pending_actions = user?.data?.pending_actions?.filter(
      (action: string) => action !== "syncFollowers"
    );
    await updateUserData({ pending_actions });
    queryClient.invalidateQueries({ queryKey: ['user', session?.userId] });
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
              description="Find and rate your favorite bands, sync from Spotify, and use ratings to personalize playlists and filters."
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
          {favBandsStatus === "error" && <> Error: {favBandsError?.message}</>}

          <div className="rounded-lg border p-4 mt-4">
            <h2 className="text-lg font-bold">My Favorites</h2>
            <DataTable columns={followedColumns} data={followedBands || []} />
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
          <p>{`for /d %i in ("E:\#Muusika\*") do @echo %~nxi >> "E:\#Muusika\folders.csv"`}</p>
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
          <DataTable columns={unfollowedColumns} data={unfollowedBands || []} />
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
    const spotifyId = await fetchEnvironmentVariables("SPOTIFY_ID");
    const BASE_URL = "https://accounts.spotify.com/authorize";

    // Use the same callback route but with popup=true parameter
    const redirectUrl = `${window.location.origin}/api/auth/spotify/callback?popup=true`;

    const authUrl = `${BASE_URL}?response_type=code&client_id=${spotifyId}&scope=${encodeURIComponent(
      scope
    )}&redirect_uri=${encodeURIComponent(redirectUrl)}&show_dialog=true`;
    
    const popupWindow = window.open(
      authUrl, 
      "SpotifyAuth", 
      "width=500,height=600,scrollbars=yes,resizable=yes"
    );
    
    if (!popupWindow || popupWindow.closed || typeof popupWindow.closed == "undefined") {
      alert("Popup blocked. Please allow popups for this website.");
      return null;
    }

    return null; // Token will be received via postMessage
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
