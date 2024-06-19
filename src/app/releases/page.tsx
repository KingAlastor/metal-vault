import getSession from "@/lib/auth/getSession";

import { Metadata } from "next";
import ReleasesPage from "./ReleasesPage";

export const metadata: Metadata = {
  title: "Releases",
};

export default async function Page() {
  const session = await getSession();
  const user = session?.user;
  console.log("user", user);
  return <ReleasesPage user={user}/>;
}