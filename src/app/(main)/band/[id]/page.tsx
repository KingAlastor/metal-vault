import { BandCard } from "@/components/band/band-card";
import { auth } from "@/auth";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Band",
};

export default async function Page() {
  const session = await auth();
  const user = session?.user;

  return <BandCard />;
}
