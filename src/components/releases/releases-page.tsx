"use client";

import React, { useState } from "react";
import { ReleasesDataTable } from "./releases-data-table";
import { BandAlbum, columns } from "./releases-table-columns";
import { ReleasesFiltersForm } from "./releases-filters-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { useSession, useUser } from "@/lib/session/client-hooks";

export default function ReleasesPage() {
  const {data: session } = useSession();
  const { data: user } = useUser(session?.userId);
  const [isOpen, setIsOpen] = useState(false);
  const filters = user?.release_settings || {};

  const {
    data: releases,
    isLoading,
    status,
    error,
  } = useQuery({
    queryKey: ["releases"],
    queryFn: () => kyInstance.get("api/releases").json<BandAlbum[]>(),
  });

  const handleFormSubmit = () => {
    setIsOpen(false);
  };

  return (
    <div className="container mx-auto py-10">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2 mb-4"
      >
        <CollapsibleTrigger className="w-full rounded-lg border p-2 flex items-center bg-collapsible text-left">
          <Image src="/Filters.svg" alt="New Event" width={24} height={24} />
          <span className="flex-1 ml-3">Filters</span>
          <div className="h-4 w-4">
            <ChevronDown />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ReleasesFiltersForm
             onClose={handleFormSubmit}
          />
        </CollapsibleContent>
      </Collapsible>

      {isLoading &&  <p className="text-center text-muted-foreground">Loading</p>}
      {error && <>Error: {error.message}</>}

      <ReleasesDataTable columns={columns} data={releases || []} />
    </div>
  );
}
