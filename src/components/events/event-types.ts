import { User } from "next-auth";
import { Dispatch, SetStateAction } from "react";

export type CreateEventFormProps = {
  setOpen: Dispatch<SetStateAction<boolean>>;
  event?: Event;
};

type EventUser = {
  name: string;
  userName: string | null;
  image: string | null;
  role: string | null;
};

export type Event = {
  id: string;
  userId: string, 
  eventName: string;
  country?: string;
  city?: string;
  fromDate: Date;
  toDate: Date;
  bands: string[];
  bandIds: string[];
  genreTags: string[];
  imageUrl: string | null;
  website: string | null;
  createdAt: Date;
  user: EventUser;
  isUserOwner: boolean;
};

export type AddEventProps = {
  id: string,
  eventName: string;
  country: string;
  city: string;
  dateRange: { from: Date; to: Date };
  bands: string[];
  bandIds?: string[];
  genreTags: string[];
  imageUrl: string;
  website: string;
};

export type EventFilters = {
  favorites_only?: boolean;
  favorite_genres_only?: boolean;
  country?: string[];
};

export type EventQueryParams = {
  cursor: string | undefined;
  pageSize: number;
};

export type EventCardsProps = {
  events: Event[];
};

export type EventCardProps = {
  event: Event;
  favbands: FavBand[];
}

type FavBand = {
  id: string, 
  namePretty: string, 
  country: string, 
  genreTags: string[],
  follower: number,
  status: string,
}

export type EventCountry = {
  name: {
    common: string;
  };
  cca2: string;
};
