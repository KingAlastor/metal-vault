import getSession from "@/lib/auth/getSession";

import { Metadata } from "next";
import { redirect } from "next/navigation";
import FollowArtistsPage from "./FollowArtistsPage";

export const metadata: Metadata = {
  title: "Followed Bands",
};

export default async function Page() {
  //client side vs server side
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect("/api/auth/signin?callbackUrl=/user/followArtists");
  }

  /* return <FollowArtistsPage user={user} />; */
  return (
    <div>
      Follow Artists Page
    </div>
  )
}