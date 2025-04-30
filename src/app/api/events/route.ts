import { Event, EventFilters } from "@/components/events/event-types";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session/server-actions";
import { getEventsByFilters } from "@/lib/data/events-data";
import { getFullUserData } from "@/lib/data/user-data";

export type EventsPageData = {
  events: Event[];
  next_cursor: string | null;
};

export async function GET(req: NextRequest) {
  const session = await getSession();

  try {
    const queryParams = {
      cursor: req.nextUrl.searchParams.get("cursor") || undefined,
      page_size: 3,
    };

    let filters: EventFilters = {};
    if (session.userId) {
      const userData = await getFullUserData(session.userId);
      if (userData?.events_settings) {
        filters = JSON.parse(userData.events_settings);
      }
    }
    const events = await getEventsByFilters(filters, queryParams);

    const next_cursor = events.length > queryParams.page_size
    ? events[queryParams.page_size - 1]?.fromDate.toISOString()
    : null;

    const data: EventsPageData = {
      events: events.slice(0, queryParams.page_size),
      next_cursor: next_cursor ? new Date(next_cursor).toISOString() : null, 
    };
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
