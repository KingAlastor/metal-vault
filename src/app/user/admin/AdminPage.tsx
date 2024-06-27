"use client";

import { Button } from "@/components/ui/button";
import { User } from "next-auth";
import { syncBandDataFromArchives } from "./band-data-actions";

interface EmailUpdatesPageProps {
  user: User;
}

export default function AdminPage() {

  const handleSyncClick = async () => {
    await syncBandDataFromArchives();
  };
  return (
    <div>
      <Button className="text-white" onClick={handleSyncClick}>Sync Band Data</Button>
    </div>
  );
}
