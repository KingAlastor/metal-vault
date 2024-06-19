"use client";

import React, { useEffect, useState } from "react";
import { ReleasesDataTable } from "./releases-data-table";
import { BandAlbum, columns } from "./releases-table-columns";
import { FiltersForm } from "./filters-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { getReleases } from "./filters-data-actions";
import { User } from "next-auth";

interface ReleasesPageProps {
  user?: User;
}

export default function ReleasesPage({user}: ReleasesPageProps) {
  const [releases, setReleases] = useState<BandAlbum[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const jsonData = user?.emailSettings;

    const fetchReleases = async () => {
      const releases = await getReleases(jsonData);
      setReleases(releases);
    };
  
    fetchReleases(); 
  }, []);

  return (
    <div className="container mx-auto py-10">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2 mb-4"
      >
        <CollapsibleTrigger className="rounded-lg border p-4 w-full flex justify-between items-center">
          Filters{" "}
          <div className="h-4 w-4">
            <ChevronDown />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <FiltersForm
            setIsOpen={setIsOpen}
            releases={releases}
            setReleases={setReleases}
          />
        </CollapsibleContent>
      </Collapsible>

      <ReleasesDataTable columns={columns} data={releases} />
    </div>
  );
}
