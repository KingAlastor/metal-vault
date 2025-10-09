"use client";
import Image from "next/image";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { formatDateWithNamedMonth } from "@/lib/general/dateTime";
import React, { useState } from "react";
import { EventCardProps } from "./event-types";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { ChevronDown } from "lucide-react";
import useWindowSize from "@/lib/hooks/get-window-size";

export const EventCard = ({ event, favbands }: EventCardProps) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [isBandsOpen, setIsBandsOpen] = useState(false);
  const size = useWindowSize();
  const favoriteMatchingBands = favbands
    .filter((favband) => event.band_ids.includes(favband.id))
    .map((band) => band.namePretty)
    .sort((a, b) => a.localeCompare(b));

  const imagePath =
    process.env.NODE_ENV === "production"
      ? `https://www.metal-vault.com/images/${event.image_url}`
      : `/images/${event.image_url}`;

  const eventDetails = (
    <div className="flex flex-col justify-between">
      <>
        <p>
          {event.country}, {event.city}
        </p>
        <p>
          {formatDateWithNamedMonth(event.from_date)} -{" "}
          {formatDateWithNamedMonth(event.to_date)}
        </p>
      </>
    </div>
  );

  return (
    <div className="event-card p-2">
      {event.website ? (
        <a
          href={
            event.website.startsWith("http")
              ? event.website
              : `https://${event.website}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-1 no-underline-hover"
        >
          <p className="font-bold xxl-font w-full text-center mb-3 text-inherit">
            {event.event_name}
          </p>
        </a>
      ) : (
        <p className="font-bold xxl-font w-full text-center mb-3">
          {event.event_name}
        </p>
      )}

      {size.width <= 400 ? (
        <div className="flex flex-col items-center w-full">
          {imagePath && (
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
                src={imagePath}
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
          {imagePath && (
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
                src={imagePath}
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
      {favoriteMatchingBands.length > 0 && (
        <p className="m-font mt-2">
          My favorites: {favoriteMatchingBands.join(", ")}
        </p>
      )}

      {imagePath && (
        <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
          <DialogContent className="max-w-3xl">
            <DialogTitle className="sr-only">
              Event Image for {event.event_name}
            </DialogTitle>
            <div className="relative w-full h-[80vh]">
              <Image
                src={imagePath}
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
          <span>Line-up</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isBandsOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="overflow-y-auto max-h-[300px] w-full rounded-md border mt-2">
            <div className="p-2">
              {event.bands.map((bandItem, index) => {
                let band;
                try {
                  band =
                    typeof bandItem === "string"
                      ? JSON.parse(bandItem)
                      : bandItem;
                } catch (error) {
                  // Handle plain string case
                  band = { namePretty: bandItem, genreTags: [], country: "" };
                }

                const genreTags = band.genreTags || [];
                const country = band.country || "";

                return (
                  <React.Fragment key={index}>
                    <span className="m-font ml-1">
                      {band.namePretty}
                      {genreTags.length > 0 && ` (${genreTags.join(", ")})`}
                      {country && ` (${country})`}
                    </span>
                    {index < event.bands.length - 1 && (
                      <Separator className="my-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
