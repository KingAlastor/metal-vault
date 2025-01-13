"use server";

import { fetchUserFavoriteBands } from "../user/followArtists/follow-artists-data-actions";
import { auth } from "@/auth";
import {
  AddEventProps,
  EventFilters,
  EventQueryParams,
} from "@/components/events/event-types";
import { prisma } from "@/lib/prisma";

export const addEvent = async (event: AddEventProps) => {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    throw new Error(
      "User ID is undefined. User must be logged in to access favorites."
    );
  }

  try {
    const newEvent = await prisma.events.create({
      data: {
        userId: user.id,
        eventName: event.eventName,
        country: event.country,
        city: event.city,
        fromDate: event.fromDate,
        toDate: event.toDate,
        bands: event.bands,
        bandIds: event.bandIds,
        genreTags: event.genreTags,
        website: event.website,
      },
      include: { user: true },
    });

    return newEvent;
  } catch (error) {
    console.error("Error updating bands table data:", error);
    throw error;
  }
};

export const getEventsByFilters = async (
  filters: EventFilters,
  queryParams: EventQueryParams
) => {
  const session = await auth();
  const user = session?.user;
  let where = {};

  if (filters?.favorites_only) {
    const favorites = await fetchUserFavoriteBands();
    if (favorites.length > 0)
      where = {
        ...where,
        bandId: {
          in: favorites,
        },
      };
  }

  if (filters?.favorite_genres_only && user?.genreTags) {
    where = {
      ...where,
      genreTags: {
        hasSome: user.genreTags,
      },
    };
  }

  console.log("where clause: ", where);

  const events = await prisma.events.findMany({
    select: {
      id: true,
      userId: true,
      eventName: true,
      country: true,
      city: true,
      fromDate: true,
      toDate: true,
      bands: true,
      bandIds: true,
      genreTags: true,
      website: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          userName: true,
          image: true,
          role: true,
        },
      },
    },
    where: where,
    orderBy: { fromDate: "desc" },
    take: queryParams.pageSize + 1,
    cursor: queryParams.cursor ? { id: queryParams.cursor } : undefined,
  });

  return events;
};

export const deleteEvent = async (eventId: string) => {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    throw new Error(
      "User ID is undefined. User must be logged in to access favorites."
    );
  }

  try {
    const deletedPost = await prisma.events.delete({
      where: {
        id: eventId,
      },
    });

    return deletedPost;
  } catch (error) {
    console.error("Error updating bands table data:", error);
    throw error;
  }
};
