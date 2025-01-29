import FollowArtistsPage from "@/components/user/followArtists/follow-artists-page";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Followed Bands",
};

export default async function Page() {
  return (
    <>
      <FollowArtistsPage/>
    </>
  )
}