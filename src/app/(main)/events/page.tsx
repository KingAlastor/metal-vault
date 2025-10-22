import { EventsPage } from "@/components/events/events-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
};

export default async function Page() {
  return <EventsPage />
}