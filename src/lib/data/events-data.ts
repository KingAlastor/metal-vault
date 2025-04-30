"use server";

import sql from "../db";
import { getSession } from "../session/server-actions";
import { logUnauthorizedAccess } from "../loggers/auth-log";
import {
  AddEventProps,
  EventFilters,
  EventQueryParams,
  Event as EventType
} from "@/components/events/event-types";

export const addOrUpdateEvent = async (event: AddEventProps) => {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
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
        user: userInfo[0]
      };
    }
  } catch (error) {
    console.error("Error updating events table data:", error);
    throw error;
  }
};

export const getEventsByFilters = async (
  filters: EventFilters,
  queryParams: EventQueryParams
): Promise<EventType[]> => {
  const session = await getSession();

  let userGenreTags: string[] | null = null;

  if (filters?.favorite_genres_only && session.userId) {
    try {
      const userResult = await sql<{ genre_tags: string[] | null }[]>`
        SELECT genre_tags
        FROM users
        WHERE id = ${session.userId}
      `;
      userGenreTags = userResult[0]?.genre_tags ?? null;
    } catch (error) {
      console.error("Error fetching user genres:", error);
      return [];
    }
  }

  const conditions: string[] = [];
  const params: any[] = [];

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  conditions.push(`e.from_date >= '${today.toISOString()}'::timestamp with time zone`);

  // Add condition for favorite genres
  if (filters?.favorite_genres_only && userGenreTags && userGenreTags.length > 0) {
    const genreTagsArray = `ARRAY[${userGenreTags.map((tag) => `'${tag}'`).join(", ")}]::text[]`;
    conditions.push(`e.genre_tags && ${genreTagsArray}`);
  }

  // Handle cursor for pagination
  if (queryParams.cursor) {
    conditions.push(`e.from_date > '${queryParams.cursor}'::timestamp with time zone`);
  }

  const limitValue = queryParams.page_size + 1;

  // Build the WHERE clause
  let whereClause = "";
  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(" AND ")}`;
  }

  const query = `
    SELECT
      e.id,
      e.user_id AS "userId",
      e.event_name AS "eventName",
      e.country,
      e.city,
      e.from_date AS "fromDate",
      e.to_date AS "toDate",
      e.bands,
      e.band_ids AS "bandIds",
      e.genre_tags AS "genreTags",
      e.image_url AS "imageUrl",
      e.website,
      e.created_at AS "createdAt",
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
    ${whereClause}
    ORDER BY e.from_date ASC, e.id ASC
    LIMIT ${limitValue}
  `;


  try {
    const events = await sql.unsafe<EventType[]>(query, params);
    return events.map((event) => ({
      ...event,
      isUserOwner: session.userId === event.userId,
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
      console.error("Query:", query);
      console.error("Params:", params);
    }
    return [];
  }
};


export const deleteEvent = async (eventId: string) => {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    logUnauthorizedAccess(session.userId || 'unknown');
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