"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminToolsTab } from "./admin-tools-tab";

export default function AdminPage() {
  return (
    <Tabs defaultValue="tools" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="tools">Tools</TabsTrigger>
        <TabsTrigger value="other">Other</TabsTrigger>
      </TabsList>
      <TabsContent value="tools">
        <AdminToolsTab />
      </TabsContent>
      <TabsContent value="other">
        <div>Other content goes here</div>
      </TabsContent>
    </Tabs>
  );
}
