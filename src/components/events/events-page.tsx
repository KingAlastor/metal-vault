"use client";

import { useState } from "react";
import { Event } from "./event-types";
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
import Image from "next/image";
import { EventsLoadingSkeleton } from "./events-loading-skeleton";
import { useSession } from "@/lib/session/client-hooks";
import { useUser } from "@/lib/session/client-hooks";

export function EventsPage() {
  const {data: session } = useSession();
  const user = useUser(session?.userId);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState(
    JSON.parse(user?.data?.posts_settings || "{}")
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
        <CollapsibleTrigger className="w-full rounded-lg border p-2 flex items-center bg-collapsible text-left">
          <Image src="/Filters.svg" alt="New Event" width={24} height={24} />
          <span className="ml-3 flex-1">Filters</span>
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
      {status === "pending" && <EventsLoadingSkeleton />}
      {status === "success" && !events.length && !hasNextPage && (
        <p className="text-center text-muted-foreground">No events found</p>
      )}
      {status === "error" && <>Error: {error.message}</>}

      {status === "success" && events.length > 0 && (
        <InfiniteScrollContainer
          onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
        >
          <EventCards events={events} />
          {isFetchingNextPage && (
            <Loader2 className="mx-auto my-3 animate-spin" />
          )}
        </InfiniteScrollContainer>
      )}
    </div>
  );
}
