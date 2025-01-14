"use client";

import { useState } from "react";
import { EventsPageProps, Event } from "./event-types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronDown, Loader2 } from "lucide-react";
import { EventsFiltersForm } from "./events-filters-form";
import InfiniteScrollContainer from "../shared/infinite-scroll-container";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { EventsPageData } from "@/app/api/events/route";
import { EventCards } from "./event-cards";
import { CreateEventCard } from "./create-event-card";

export function EventsPage({ user }: EventsPageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState(
    JSON.parse(user?.postsSettings || "{}")
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["events-feed"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/events",
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<EventsPageData>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,  
  });

  const events: Event[] = data?.pages.flatMap((page) => page.events) || [];

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <CreateEventCard />
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2 mb-4"
      >
        <CollapsibleTrigger className="w-full rounded-lg border p-4 flex justify-between items-center bg-collapsible text-left">
          <span>Filters</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <EventsFiltersForm
            setIsOpen={setIsOpen}
            filters={filters}
            setFilters={setFilters}
          />
        </CollapsibleContent>
      </Collapsible>

      <InfiniteScrollContainer
        onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      >
        <EventCards events={events} />
        {isFetchingNextPage && (
          <Loader2 className="mx-auto my-3 animate-spin" />
        )}
      </InfiniteScrollContainer>
    </div>
  );
}
