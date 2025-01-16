"use server";

import { fetchUserFavoriteBands } from "../user/followArtists/follow-artists-data-actions";
import { auth } from "@/auth";
import {
  AddEventProps,
  Event,
  EventFilters,
  EventQueryParams,
} from "@/components/events/event-types";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// @ts-ignore
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
        fromDate: event.dateRange.from,
        toDate: event.dateRange.to,
        bands: event.bands,
        bandIds: event.bandIds,
        genreTags: event.genreTags,
        imageUrl: event.imageUrl,
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
  console.log("[Server] Starting getEventsByFilters");
  const session = await auth();
  const user = session?.user;
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  let where: Prisma.EventsWhereInput = {
    toDate: {
      gte: today,
    },
  };

/*   if (filters?.favorites_only) {
    const favorites = await fetchUserFavoriteBands();
    if (favorites.length > 0)
      where = {
        ...where,
        bandIs: {
          in: favorites,
        },
      };
  } */

  if (filters?.favorite_genres_only && user?.genreTags) {
    where = {
      ...where,
      genreTags: {
        hasSome: Array.isArray(user.genreTags) ? user.genreTags : [user.genreTags],
      },
    };
  }

  const events = (await prisma.events.findMany({
    include: {
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
    orderBy: { fromDate: "asc" },
    take: queryParams.pageSize + 1,
    cursor: queryParams.cursor ? { id: queryParams.cursor } : undefined,
  })) as unknown as Event[];
  
  console.log("[Server] Events found:", events.length);
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

export const isUserEventOwner = async (eventId: string) => {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return { success: false, message: "User ID undefined", isOwner: false };
  }

  try {
    const event = await prisma.events.findFirst({
      where: {
        AND: [{ id: eventId }, { userId: user.id }],
      },
    });

    return {
      success: !!event,
      message: "Validation successful",
      isOwner: !!event,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error checking ownership",
      isOwner: false,
    };
  }
};
