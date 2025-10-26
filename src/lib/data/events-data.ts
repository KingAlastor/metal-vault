"use server";

import sql from "../db";
import { getSession } from "../session/server-actions";
import { logUnauthorizedAccess } from "../loggers/auth-log";
import {
  AddEventProps,
  EventQueryParams,
  Event as EventType,
} from "@/components/events/event-types";
import { getFullUserData } from "./user-data";
import { fetchUserFavoriteBands } from "./follow-artists-data";

export const addOrUpdateEvent = async (event: AddEventProps) => {
  const session = await getSession();

  if (!session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to add or update events");
  }

  try {
    let updatedEvent;

    if (event.id) {
      // Update existing event
      updatedEvent = await sql`
        UPDATE events
        SET 
          event_name = ${event.eventName},
          country = ${event.country},
          city = ${event.city},
          venue = ${event.venue},
          from_date = ${event.dateRange.from},
          to_date = ${event.dateRange.to},
          bands = ${event.bands},
          band_ids = ${event.bandIds ?? []},
          genre_tags = ${event.genreTags},
          image_url = ${event.imageUrl},
          website = ${event.website}
        WHERE id = ${event.id}
        RETURNING *
      `;

      return updatedEvent[0];
    } else {
      // Create new event
      updatedEvent = await sql`
        INSERT INTO events (
          id,
          user_id,
          event_name,
          country,
          city,
          from_date,
          to_date,
          bands,
          band_ids,
          genre_tags,
          image_url,
          website,
          created_at
        ) VALUES (
          ${crypto.randomUUID()},
          ${session.userId},
          ${event.eventName},
          ${event.country},
          ${event.city},
          ${event.dateRange.from},
          ${event.dateRange.to},
          ${event.bands},
          ${event.bandIds ?? []},
          ${event.genreTags},
          ${event.imageUrl},
          ${event.website},
          NOW() AT TIME ZONE 'UTC'
        )
        RETURNING *
      `;

      // Get user info for the created event
      const userInfo = await sql`
        SELECT
          name,
          user_name,
          image,
          role
        FROM users
        WHERE id = ${session.userId}
      `;

      // Combine event with user info
      return {
        ...updatedEvent[0],
        user: userInfo[0],
      };
    }
  } catch (error) {
    console.error("Error updating events table data:", error);
    throw error;
  }
};

export const getEventsByFilters = async (
  queryParams: EventQueryParams
): Promise<EventType[]> => {
  const session = await getSession();
  const user = await getFullUserData(session.userId);
  const filters = user?.events_settings || {};

  let followedBandIds: string[] = [];
  if (session.userId) {
    followedBandIds = await fetchUserFavoriteBands();
  }

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const limitValue = queryParams.page_size + 1;

  // Build conditions using sql fragments
  const conditions = [
    sql`e.from_date >= ${today.toISOString()}::timestamp with time zone`,
  ];

  // Country filter (future-proof for multiple countries)
  if (filters && filters.country && user?.location) {
    // For now, single country; in future: user.location could be array
    conditions.push(sql`e.country = ${user.location}`);
  }

  // Cursor for pagination
  if (queryParams.cursor) {
    conditions.push(
      sql`e.from_date > ${queryParams.cursor}::timestamp with time zone`
    );
  }

  // Join conditions with AND
  const joinedConditions = conditions.reduce((acc, cond, i) =>
    i === 0 ? cond : sql`${acc} AND ${cond}`
  );

  try {
    const events = await sql`
      SELECT
        e.id,
        e.user_id,
        e.event_name,
        e.country,
        e.city,
        e.venue,
        e.from_date,
        e.to_date,
        e.bands,
        e.band_ids,
        e.genre_tags,
        e.image_url,
        e.website,
        e.created_at,
        (
          SELECT json_build_object(
            'name', u.name,
            'user_name', u.user_name,
            'image', u.image,
            'role', u.role
          )
          FROM users u
          WHERE u.id = e.user_id
        ) AS user
      FROM events e
      WHERE ${joinedConditions}
      ORDER BY e.from_date ASC, e.id ASC
      LIMIT ${limitValue}
    `;

    const followedBandsSet = new Set(followedBandIds);
    const favoriteGenresSet = new Set(user?.genre_tags);

    const filteredEvents: EventType[] = [];
    for (const event of events) {
      let shouldInclude = true;

      if (filters?.favorites_only || filters?.favorite_genres_only) {
        const isFavoriteBand =
          event.band_ids.some((id: any) => followedBandsSet.has(id)) || false;
        const isFavoriteGenre =
          event.genre_tags.some((tag: string) => favoriteGenresSet.has(tag)) ||
          false;
        console.log(
          `Event ${event.id}: isFavoriteBand=${isFavoriteBand}, isFavoriteGenre=${isFavoriteGenre}`
        );
        shouldInclude =
          ((filters.favorites_only ?? false) && isFavoriteBand) ||
          ((filters.favorite_genres_only ?? false) && isFavoriteGenre);
        console.log(
          `Event ${event.id} shouldInclude after filters: ${shouldInclude}`
        );
      }

      if (shouldInclude) {
        const { user_id, ...cleanEvent } = event;
        filteredEvents.push({
          ...cleanEvent,
          is_owner: session.userId === event.user_id,
        } as EventType);
      }
    }
    return filteredEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    return [];
  }
};

export const deleteEvent = async (eventId: string) => {
  const session = await getSession();

  if (!session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to delete events");
  }

  try {
    const deletedEvent = await sql`
      DELETE FROM events
      WHERE id = ${eventId}
      RETURNING *
    `;

    return deletedEvent[0];
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

export type SearchTermEvent = {
  id: string, 
  event_name: string,
  eventData: string,
};

export async function getEventsBySearchTerm(searchTerm: string) {
    const session = await getSession();

  if (!session.userId) {
    logUnauthorizedAccess(session.userId || "unknown");
    throw new Error("User must be logged in to delete events");
  }

  try {
    const events = await sql`
      SELECT 
      id, event_name, country, city, venue, from_date, to_date 
      FROM events
      WHERE event_name ILIKE ${'%' + searchTerm + '%'}
    `;
    if (events) {
    const formattedEvents = events.map((event) => ({
      id: event.id,
      event_name: event.event_name,
      eventData: `${event.event_name} - ${event.venue}/${event.city}/${event.country}`
    }))

    return formattedEvents; 
  } else {
    return [];
  }
  } catch (error) {
    console.error("Failed to fetch events: ", error)
    return [];
  }
}