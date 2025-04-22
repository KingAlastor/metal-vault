import { Event, EventFilters } from "@/components/events/event-types";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session/server-actions";
import { getEventsByFilters } from "@/lib/data/events-data";
import { getFullUserData } from "@/lib/data/user-data";

export type EventsPageData = {
  events: Event[];
  nextCursor: string | null;
};

export async function GET(req: NextRequest) {
  const session = await getSession();

  try {
    const queryParams = {
      cursor: req.nextUrl.searchParams.get("cursor") || undefined,
      pageSize: 3,
    };

    let filters: EventFilters = {};
    if (session.userId) {
      const userData = await getFullUserData(session.userId);
      if (userData?.events_settings) {
        filters = JSON.parse(userData.events_settings);
      }
    }

    const events = await getEventsByFilters(filters, queryParams);

    const nextCursor =
      events.length > queryParams.pageSize
        ? events[queryParams.pageSize].id
        : null;

    const data: EventsPageData = {
      events: events.slice(0, queryParams.pageSize),
      nextCursor,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
