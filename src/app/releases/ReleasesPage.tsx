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
import {
  getReleasesByFilters,
  getUserReleaseFilters,
} from "./filters-data-actions";
import { User } from "next-auth";

interface ReleasesPageProps {
  user?: User;
}

export default function ReleasesPage({ user }: ReleasesPageProps) {
  const [releases, setReleases] = useState<BandAlbum[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({}); 

  console.log("sessionuser:", user);

  useEffect(() => {
    let filters = {};
    const fetchUserFilters = async () => {
      if (user?.id) {
        const userFilters = await getUserReleaseFilters(user.id!);
        if (userFilters?.releaseSettings) {
          console.log("releasePage", userFilters.releaseSettings);
          if (typeof userFilters.releaseSettings === 'string') {
            setFilters(JSON.parse(userFilters.releaseSettings));
          } else {
            setFilters(userFilters.releaseSettings);
          }
        }
      }
    };

    const fetchReleases = async () => {
      const releases = await getReleasesByFilters(filters);
      setReleases(releases);
    };

    fetchUserFilters();
    fetchReleases();
  }, [user]);

  return (
    <div className="container mx-auto py-10">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2 mb-4"
      >
        <CollapsibleTrigger className="rounded-lg border p-4 w-full flex justify-between items-center text-white">
          Filters{" "}
          <div className="h-4 w-4">
            <ChevronDown />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="text-white">
          <FiltersForm
            setIsOpen={setIsOpen}
            setReleases={setReleases}
            filters={filters}
          />
        </CollapsibleContent>
      </Collapsible>

      <ReleasesDataTable columns={columns} data={releases} />
    </div>
  );
}
