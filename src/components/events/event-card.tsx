"use client";
import Image from "next/image";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { formatDateWithNamedMonth } from "@/lib/general/date";
import React, { useState } from "react";
import { Event, EventCardProps } from "./event-types";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { VisuallyHidden } from "../ui/visually-hidden";
import { ChevronDown } from "lucide-react";
import useWindowSize from "@/lib/hooks/get-window-size";

export const EventCard = ({ event, favbands }: EventCardProps) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [isBandsOpen, setIsBandsOpen] = useState(false);
  const [isGenressOpen, setIsGenresOpen] = useState(false);
  const size = useWindowSize();
  const favoriteMatchingBands = favbands
    .filter((favband) => event.bandIds.includes(favband.id))
    .map((band) => band.namePretty)
    .sort((a, b) => a.localeCompare(b));

  const eventDetails = (
    <div className="flex flex-col justify-between">
      <div>
        <p>
          {event.country}, {event.city}
        </p>
        <p>
          {formatDateWithNamedMonth(event.fromDate)} -{" "}
          {formatDateWithNamedMonth(event.toDate)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="event-card p-2">
      <p className="font-bold xl-font w-full text-center mb-3">
        {event.eventName}
      </p>

      {size.width <= 400 ? (
        <div className="flex flex-col items-center w-full">
          {event.imageUrl && (
            <div
              style={{
                position: "relative",
                width: "158px",
                height: "158px",
                cursor: "pointer",
              }}
              onClick={() => setShowFullImage(true)}
            >
              <Image
                src={event.imageUrl}
                alt="Event image"
                fill
                sizes="158px"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </div>
          )}
          <div className="flex flex-col justify-between mt-4 w-full text-left">
            {eventDetails}
          </div>
        </div>
      ) : (
        <div className="flex mt-2 gap-4">
          {event.imageUrl && (
            <div
              style={{
                position: "relative",
                width: "158px",
                height: "158px",
                cursor: "pointer",
              }}
              onClick={() => setShowFullImage(true)}
            >
              <Image
                src={event.imageUrl}
                alt="Event image"
                fill
                sizes="158px"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </div>
          )}
          {eventDetails}
        </div>
      )}

      <p className="m-font mt-2">
        My favorites: {favoriteMatchingBands.join(", ")}
      </p>

      {event.imageUrl && (
        <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
          <DialogContent className="max-w-3xl">
            <VisuallyHidden>
              <DialogTitle>Event Image for {event.eventName}</DialogTitle>
            </VisuallyHidden>
            <div className="relative w-full h-[80vh]">
              <Image
                src={event.imageUrl}
                alt="Event image full size"
                fill
                style={{
                  objectFit: "contain",
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      <Collapsible
        open={isBandsOpen}
        onOpenChange={setIsBandsOpen}
        className="w-full"
      >
        <CollapsibleTrigger className="mt-3 flex items-center justify-between w-full px-4 py-2 rounded-md border">
          <span>All Bands</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isBandsOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="overflow-y-auto max-h-[300px] w-full rounded-md border mt-2">
            <div className="p-2">
              {event.bands.map((band, index) => (
                <React.Fragment key={index}>
                  <div className="s-text">{band}</div>
                  {index < event.bands.length - 1 && (
                    <Separator className="my-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible
        open={isGenressOpen}
        onOpenChange={setIsGenresOpen}
        className="w-full"
      >
        <CollapsibleTrigger className="mt-1 flex items-center justify-between w-full px-4 py-2 rounded-md border">
          <span>Genres</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isGenressOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="overflow-y-auto max-h-[300px] w-full rounded-md border mt-2 ">
            <div className="p-2">
              {event.genreTags && <p>{event.genreTags.join(", ")}</p>}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
