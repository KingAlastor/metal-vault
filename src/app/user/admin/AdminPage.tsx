"use client";

import { Button } from "@/components/ui/button";
import { User } from "next-auth";
import { syncBandDataFromArchives } from "./band-data-actions";
import { syncAlbumDataFromArchives } from "./album-data-actions";

interface EmailUpdatesPageProps {
  user: User;
}

export default function AdminPage() {
  const handleBandSyncClick = async () => {
    await syncBandDataFromArchives();
  };

  const handleAlbumSyncClick = async () => {
    await syncAlbumDataFromArchives();
  };
  return (
    <div>
      <Button className="text-white" onClick={handleBandSyncClick}>
        Sync Band Data
      </Button>
      <Button className="text-white" onClick={handleAlbumSyncClick}>
        Sync Album Data
      </Button>
    </div>
  );
}
