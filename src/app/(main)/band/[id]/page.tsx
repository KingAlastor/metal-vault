import { BandCard } from "@/components/band/band-card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Band",
};

export default async function Page() {
  return <BandCard />;
}
