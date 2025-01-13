import { auth } from "@/auth";
import { Event, EventFilters } from "@/components/events/event-types";
import { getEventsByFilters } from "@/lib/data/events/events-data-actions";
import { getUserPostsFilters } from "@/lib/data/posts/posts-filters-data-actions";
import { NextRequest } from "next/server";

export type EventsPageData = {
  events: Event[];
  nextCursor: string | null;
};

export async function GET(req: NextRequest) {
  try {
    const queryParams = {
      cursor: req.nextUrl.searchParams.get("cursor") || undefined,
      pageSize: 3,
    };
    
    const session = await auth();
    const user = session?.user;
    console.log("user", user);
    
    let filters: EventFilters = {};
    if (user?.id) {
      filters = await getUserPostsFilters(user.id);
    }

    const events: Event[] = await getEventsByFilters(filters, queryParams);

    const nextCursor =
    events.length > queryParams.pageSize
        ? events[queryParams.pageSize].id
        : null;

    const data: EventsPageData = {
      events: events.slice(0, queryParams.pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
