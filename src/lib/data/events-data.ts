"use server";

import sql from "../db";
import { getSession } from "../session/actions";
import { logUnauthorizedAccess } from "../loggers/auth-log";
import {
  AddEventProps,
  EventFilters,
  EventQueryParams,
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
          "fromDate" = ${event.dateRange.from},
          "toDate" = ${event.dateRange.to},
          bands = ${event.bands},
          "bandIds" = ${event.bandIds ?? []},
          genre_tags = ${event.genreTags},
          "imageUrl" = ${event.imageUrl},
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
          "fromDate",
          "toDate",
          bands,
          "bandIds",
          genre_tags,
          "imageUrl",
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
          "userName",
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
) => {
  const session = await getSession();
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  let whereConditions = [];
  let params = [];
  
  // Base condition: event hasn't ended yet
  whereConditions.push(`"toDate" >= ${today.toISOString()}`);

  // Handle favorite genres filter
  if (filters?.favorite_genres_only && session.isLoggedIn) {
    // Get user's genre tags
    // @ts-ignore -- Line 122: postgres-js has incomplete types for template literals with dynamic parameters
    // This is safe as we've already checked session.isLoggedIn and session.userId exists
    const userGenres = await sql`
      SELECT genre_tags
      FROM users
      WHERE id = ${session.userId}
    `;

    if (userGenres[0]?.genre_tags) {
      const genreTags = Array.isArray(userGenres[0].genre_tags) 
        ? userGenres[0].genre_tags 
        : [userGenres[0].genre_tags];
        
      if (genreTags.length > 0) {
        // @ts-ignore - postgres-js has incomplete types for array operations
        // This is safe as we're using proper array syntax for PostgreSQL
        whereConditions.push(`genre_tags && ${JSON.stringify(genreTags)}`);
      }
    }
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(" AND ")}` 
    : "";

  // Handle pagination
  let cursorCondition = "";
  if (queryParams.cursor) {
    cursorCondition = `AND e.id > ${queryParams.cursor}`;
  }

  const events = await sql`
    WITH events_data AS (
      SELECT
        e.id,
        e.user_id AS "userId",
        e.event_name AS "eventName",
        e.country,
        e.city,
        e."fromDate",
        e."toDate",
        e.bands,
        e."bandIds",
        e.genre_tags AS "genreTags",
        e."imageUrl",
        e.website,
        e.created_at AS "createdAt",
        u.name,
        u."userName",
        u.image,
        u.role
      FROM events e
      JOIN users u ON e.user_id = u.id
      ${sql.unsafe(whereClause)}
      ${sql.unsafe(cursorCondition)}
      ORDER BY e."fromDate" ASC
      LIMIT ${queryParams.pageSize + 1}
    )
    SELECT * FROM events_data
  `;

  // Map results to include isUserOwner
  const eventsWithOwner = events.map((record) => {
    const { userId, name, userName, image, role, ...rest } = record;
    return {
      ...rest,
      user: {
        name,
        userName,
        image,
        role,
      },
      isUserOwner: session.userId ? userId === session.userId : false,
    };
  });

  return eventsWithOwner;
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