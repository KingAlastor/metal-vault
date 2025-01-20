"use client";

import React, { useEffect, useState } from "react";
import { ReleasesDataTable } from "./releases-data-table";
import { BandAlbum, columns } from "./releases-table-columns";
import { FiltersForm } from "./releases-filters-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import {
  getReleasesByFilters,
  getUserReleaseFilters,
  ReleasesFilters,
} from "../../lib/data/releases/releases-filters-data-actions";
import { User } from "next-auth";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";

interface ReleasesPageProps {
  user?: User;
}

export default function ReleasesPage({ user }: ReleasesPageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ReleasesFilters>(
    {} as ReleasesFilters
  );

  const {
    data: releases,
    isLoading,
    status,
    error,
  } = useQuery({
    queryKey: ["releases"],
    queryFn: () => kyInstance.get("api/releases").json<BandAlbum[]>(),
  });

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
          <FiltersForm
            setIsOpen={setIsOpen}
            filters={filters}
            setFilters={setFilters}
          />
        </CollapsibleContent>
      </Collapsible>

      {isLoading &&  <p className="text-center text-muted-foreground">Loading</p>}
      {error && <div>Error: {error.message}</div>}
      
      <ReleasesDataTable columns={columns} data={releases || []} />
    </div>
  );
}
