import { BandCard } from "@/components/band/band-card";
import getSession from "@/lib/auth/getSession";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Band",
};

export default async function Page() {
  const session = await getSession();
  const user = session?.user;

  return <BandCard />;
}
