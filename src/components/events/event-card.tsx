"use client";

import { Event } from "./event-types";

export const EventCard = (event: Event) => {
  return <div>{event.eventName}</div>;
};
