"use client";

import { Button } from "@/components/ui/button";
import { User } from "next-auth";
import {
  syncBandDataFromArchives,
  syncLatestBandAdditionsFromArchives,
} from "./band-data-actions";
import { syncAlbumDataFromArchives } from "./album-data-actions";
import { syncUpcomingReleaseDataFromArchives } from "./latest-releases-data-actions";
import { useState } from "react";

interface EmailUpdatesPageProps {
  user: User;
}

export default function AdminPage() {
  const [isBandSyncLoading, setIsBandSyncLoading] = useState(false);
  const [isAlbumSyncLoading, setIsAlbumSyncLoading] = useState(false);
  const [isUpcomingReleasesLoading, setIsUpcomingReleasesLoading] = useState(false);
  const [isLatestBandsLoading, setIsLatestBandsLoading] = useState(false);

  const handleBandSyncClick = async () => {
    setIsBandSyncLoading(true);
    await syncBandDataFromArchives();
    setIsBandSyncLoading(false);
  };

  const handleAlbumSyncClick = async () => {
    setIsAlbumSyncLoading(true);
    await syncAlbumDataFromArchives();
    setIsAlbumSyncLoading(false);
  };

  const handleUpcomingReleasesSyncClick = async () => {
    setIsUpcomingReleasesLoading(true);
    await syncUpcomingReleaseDataFromArchives();
    setIsUpcomingReleasesLoading(false);
  };

  const handleSyncLatestBandsClick = async () => {
    setIsLatestBandsLoading(true);
    await syncLatestBandAdditionsFromArchives();
    setIsLatestBandsLoading(false);
  };

  return (
    <div className="flex justify-center">
      <Button
        className="text-white"
        onClick={handleBandSyncClick}
        disabled={isBandSyncLoading}
      >
        {isBandSyncLoading ? "Loading..." : "Sync Band Data"}
      </Button>
      <Button
        className="text-white"
        onClick={handleAlbumSyncClick}
        disabled={isAlbumSyncLoading}
      >
        {isAlbumSyncLoading ? "Loading..." : "Sync Album Data"}
      </Button>
      <Button
        className="text-white"
        onClick={handleUpcomingReleasesSyncClick}
        disabled={isUpcomingReleasesLoading}
      >
        {isUpcomingReleasesLoading ? "Loading..." : "Sync Upcoming Releases"}
      </Button>
      <Button
        className="text-white"
        onClick={handleSyncLatestBandsClick}
        disabled={isLatestBandsLoading}
      >
        {isLatestBandsLoading ? "Loading..." : "Sync Latest Bands"}
      </Button>
    </div>
  );
}
