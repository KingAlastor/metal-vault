"use client";

import { Button } from "@/components/ui/button";
import { syncAlbumDataFromArchives } from "../../../lib/data/user/admin/album-data-actions";
import { syncUpcomingReleaseDataFromArchives } from "../../../lib/data/user/admin/latest-releases-data-actions";
import { useState } from "react";
import { fetchYoutubeVideoData } from "@/lib/apis/YT-api";
import { syncGenresTableFromBands } from "@/lib/data/user/admin/genres-data-actions";
import {
  syncBandDataFromArchives,
  syncLatestBandAdditionsFromArchives,
} from "./band-sync";

export function AdminToolsTab() {
  const [isBandSyncLoading, setIsBandSyncLoading] = useState(false);
  const [isAlbumSyncLoading, setIsAlbumSyncLoading] = useState(false);
  const [isUpcomingReleasesLoading, setIsUpcomingReleasesLoading] =
    useState(false);
  const [isLatestBandsLoading, setIsLatestBandsLoading] = useState(false);
  const [isTestApiLoading, setIsTestApiLoading] = useState(false);
  const [isGenresSyncLoading, setIsGenresSyncLoading] = useState(false);

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

  const handleSyncGenresClick = async () => {
    setIsGenresSyncLoading(true);
    await syncGenresTableFromBands();
    setIsGenresSyncLoading(false);
  };

  const handleYoutubeApi = async () => {
    setIsTestApiLoading(true);
    const response = async () => {
      const medialink = "https://www.youtube.com/watch?v=8UhhoJ5-k24&pp=ygUKaGF0ZSBydWdpYQ%3D%3D";
      const regExp =
        /(?:https?:\/\/)?(?:www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = regExp.exec(medialink);
      if (match && match[2]) {
        const videoId = match[2]; // Correctly extract the video ID
        const videoData = await fetchYoutubeVideoData(videoId);
        return videoData;
      } else {
        return null;
      }
    };
    response();
    setIsTestApiLoading(false);
  };
  return (
    <div className="flex flex-col space-y-2">
      <Button onClick={handleBandSyncClick} disabled={isBandSyncLoading}>
        {isBandSyncLoading ? "Loading..." : "Sync Band Data"}
      </Button>
      <Button onClick={handleAlbumSyncClick} disabled={isAlbumSyncLoading}>
        {isAlbumSyncLoading ? "Loading..." : "Sync Album Data"}
      </Button>
      <Button
        onClick={handleUpcomingReleasesSyncClick}
        disabled={isUpcomingReleasesLoading}
      >
        {isUpcomingReleasesLoading ? "Loading..." : "Sync Upcoming Releases"}
      </Button>
      <Button
        onClick={handleSyncLatestBandsClick}
        disabled={isLatestBandsLoading}
      >
        {isLatestBandsLoading ? "Loading..." : "Sync Latest Bands"}
      </Button>
      <Button onClick={handleSyncGenresClick} disabled={isGenresSyncLoading}>
        {isLatestBandsLoading ? "Loading..." : "Sync Genres Table"}
      </Button>
      <Button onClick={handleYoutubeApi} disabled={isTestApiLoading}>
        {isLatestBandsLoading ? "Loading..." : "Test API"}
      </Button>
    </div>
  );
}
