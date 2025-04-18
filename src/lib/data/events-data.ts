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
          NOW()
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
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  // Use sql tagged template literals for conditions to handle parameters
  const conditions = [sql`e.to_date >= ${today}`]; // Pass Date object directly

  // Handle favorite genres filter
  let userGenreTags: string[] | null = null;
  if (filters?.favorite_genres_only && session.isLoggedIn && session.userId) {
    const userResult = await sql<{ genre_tags: string[] | null }[]>`
      SELECT genre_tags
      FROM users
      WHERE id = ${session.userId}
    `;
    userGenreTags = userResult[0]?.genre_tags ?? null; // Get the tags
  }

  // Add genre condition IF user wants it AND we found tags
  if (filters?.favorite_genres_only && userGenreTags && userGenreTags.length > 0) {
     // Ensure it's an array even if DB stores single tag as string (adjust if needed)
     const genreTagsArray = Array.isArray(userGenreTags) ? userGenreTags : [userGenreTags];
     if (genreTagsArray.length > 0) {
        // Use the && operator with the array parameter. postgres-js handles array formatting.
        conditions.push(sql`e.genre_tags && ${genreTagsArray}`);
     }
  }

  // Construct WHERE clause
  const whereClause = conditions.length > 0 ? sql`WHERE ${sql.join(conditions, ' AND ')}` : sql``; // Use sql.join

  // Handle pagination cursor - also parameterized
  const cursorCondition = queryParams.cursor ? sql`AND e.id > ${queryParams.cursor}` : sql``;

  // Note: LIMIT clause needs a number, direct interpolation is usually safe here,
  // but ensure queryParams.pageSize is validated as a number beforehand.
  const limitClause = sql`LIMIT ${Number(queryParams.pageSize) + 1}`;


  // --- Main Query ---
  // Inject the built clauses. Since they are `sql` objects, postgres-js
  // will assemble them correctly with parameters.
  const events = await sql`
    WITH events_data AS (
      SELECT
        e.id,
        e.user_id AS "userId",
        e.event_name AS "eventName",
        e.country,
        e.city,
        e.from_date,
        e.to_date,
        e.bands,
        e.band_ids,
        e.genre_tags AS "genreTags",
        e.image_url,
        e.website,
        e.created_at AS "createdAt",
        u.name,
        u.user_name,
        u.image,
        u.role
      FROM events e
      JOIN users u ON e.user_id = u.id
      ${whereClause}  -- Inject the WHERE clause SQL object
      ${cursorCondition} -- Inject the cursor condition SQL object
      ORDER BY e.from_date ASC, e.id ASC -- Added secondary sort for stable pagination
      ${limitClause} -- Inject the LIMIT clause SQL object
    )
    SELECT * FROM events_data
  `;

  // Map results (your existing mapping logic seems okay)
  const eventsWithOwner = events.map((record) => {
     // ... (keep your mapping logic)
      const { userId, name, user_name, image, role, ...rest } = record;
      return {
        id: rest.id,
        eventName: rest.eventName,
        country: rest.country,
        city: rest.city,
        fromDate: rest.from_date, // Assuming these date types are handled correctly
        toDate: rest.to_date,     // by the driver or your mapping
        bands: rest.bands,
        bandIds: rest.band_ids,
        genreTags: rest.genreTags,
        imageUrl: rest.image_url,
        website: rest.website,
        createdAt: rest.createdAt,
        user: {
          name,
          userName: user_name,
          image,
          role
        },
        isUserOwner: session.userId ? userId === session.userId : false
      };
  });

  return eventsWithOwner as EventType[]; // Adjust type assertion if needed
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