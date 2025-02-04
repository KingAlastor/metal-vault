"use server";

import { auth } from "@/lib/auth/auth";
import {
  AddEventProps,
  Event,
  EventFilters,
  EventQueryParams,
} from "@/components/events/event-types";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";

export const addOrUpdateEvent = async (event: AddEventProps) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user?.id) {
    throw new Error(
      "User ID is undefined."
    );
  }

  try {
    let updatedEvent;

    if (event.id) {
      updatedEvent = await prisma.events.update({
        where: { id: event.id },
        data: {
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
      });
    } else {
      updatedEvent = await prisma.events.create({
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
    }

    return updatedEvent;
  } catch (error) {
    console.error("Error updating bands table data:", error);
    throw error;
  }
};

export const getEventsByFilters = async (
  filters: EventFilters,
  queryParams: EventQueryParams
) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};
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
        hasSome: Array.isArray(user.genreTags)
          ? user.genreTags
          : [user.genreTags],
      },
    };
  }

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
      imageUrl: true,
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
    orderBy: { fromDate: "asc" },
    take: queryParams.pageSize + 1,
    cursor: queryParams.cursor ? { id: queryParams.cursor } : undefined,
  });

  const eventsWithOwner = events.map((record) => {
    const { userId, ...rest } = record;
    return {
      ...rest,
      isUserOwner: user?.id ? userId === user.id : false,
    };
  });

  return eventsWithOwner;
};

export const deleteEvent = async (eventId: string) => {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    throw new Error(
      "User ID is undefined."
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
