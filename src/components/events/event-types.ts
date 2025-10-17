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
  user_id?: string, 
  event_name: string;
  country?: string;
  city?: string;
  venue?: string;
  from_date: Date;
  to_date: Date;
  bands: string[];
  band_ids: string[];
  genre_tags: string[];
  image_url: string | null;
  website: string | null;
  created_at: Date;
  user: EventUser;
  is_owner: boolean;
};

export type AddEventProps = {
  id: string,
  eventName: string;
  country: string;
  city: string;
  venue: string;
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
  country?: boolean;
};

export type EventQueryParams = {
  cursor: string | undefined;
  page_size: number;
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
  country: string | null, 
  genreTags: string[],
  followers: number | null,
  status: string | null,
  rating: number,
}

export type EventCountry = {
  name: {
    common: string;
  };
  cca2: string;
};
