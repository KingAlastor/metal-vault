"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PromoteBandForm from "./promote-band-form";
import { PromoteEventForm } from "./promote-event-form";

export default function PromoteFormPage() {
  return (
    <>
      <Tabs defaultValue="band_promo">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="band_promo">Band promotion</TabsTrigger>
          <TabsTrigger value="event_promo">Event Promotion</TabsTrigger>
        </TabsList>
        <TabsContent value="band_promo">
          <PromoteBandForm />
        </TabsContent>
        <TabsContent value="event_promo">
          <PromoteEventForm />
        </TabsContent>
      </Tabs>
    </>
  );
}
