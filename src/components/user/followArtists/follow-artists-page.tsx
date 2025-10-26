"use client";

import { DataTable } from "./bands-data-table";
import { getColumns } from "./bands-table-columns";
import { saveUserFavoriteAndUpdateFollowerCount } from "@/lib/data/follow-artists-data";
import { BandSearchBar } from "@/components/shared/search-bands-dropdown";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { FirstTimeUserNotice } from "@/components/shared/first-time-user-notice";
import { useUser } from "@/lib/session/client-hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import kyInstance from "@/lib/ky";
import { DataTableBand } from "./follow-artists-types";
import { useChangeBandRating } from "./hooks/use-change-band-rating";
import { SearchTermBand } from "@/lib/data/bands-data";
import { deleteUserPendingAction, updateUserData } from "@/lib/data/user-data";
import useWindowSize from "@/lib/hooks/get-window-size";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SyncBandListFromFile } from "./sync-bands-from-file";
import { useSessionContext } from "@/app/SessionProvider";

export default function FollowArtistsPage() {
  const { session: session } = useSessionContext();
  const user = useUser(session?.userId);
  const size = useWindowSize();

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

  const [isBandSyncListOpen, setIsBandSyncListOpen] = useState(false);
  const searchInputProps = {
    inputPlaceholder: "Search band from database...",
    clearInput: true,
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
    queryClient.invalidateQueries({ queryKey: ["user", session?.userId] });
    setIsFirstTimeUser(false);
  };

  return (
    <>
      <Tabs defaultValue="favorites">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="favorites">Favorite Bands</TabsTrigger>
          <TabsTrigger value="unfollowed">Hated Bands</TabsTrigger>
        </TabsList>
        <TabsContent value="favorites">
          <>
            {isFirstTimeUser && (
              <FirstTimeUserNotice
                title="Welcome to Your favorite bands!"
                description="Find and rate your favorite bands or upload a list file and use ratings to personalize notifications and filters."
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
              <DataTable columns={followedColumns} data={followedBands || []} />
            </div>
            <Button
              variant="outline"
              className="mt-4 mb-4 flex items-center justify-center"
              onClick={() => setIsBandSyncListOpen(true)}
            >
              <p>Import band list from file</p>
            </Button>
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
            <DataTable
              columns={unfollowedColumns}
              data={unfollowedBands || []}
            />
          </div>
        </TabsContent>
      </Tabs>
      {size.width > 640 ? (
        <>
          <Dialog
            open={isBandSyncListOpen}
            onOpenChange={setIsBandSyncListOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle> Sync favorite bands from file</DialogTitle>
              </DialogHeader>
              <SyncBandListFromFile setIsOpen={setIsBandSyncListOpen} />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <Drawer
            open={isBandSyncListOpen}
            onOpenChange={setIsBandSyncListOpen}
          >
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Sync favorite bands from file</DrawerTitle>
              </DrawerHeader>
              <SyncBandListFromFile setIsOpen={setIsBandSyncListOpen} />
            </DrawerContent>
          </Drawer>
        </>
      )}
    </>
  );
}
