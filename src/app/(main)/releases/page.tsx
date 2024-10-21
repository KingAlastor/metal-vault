import getSession from "@/lib/auth/getSession";

import { Metadata } from "next";
import ReleasesPage from "../../../components/releases/releases-page";

export const metadata: Metadata = {
  title: "Releases",
};

export default async function Page() {
  const session = await getSession();
  const user = session?.user;
  return <ReleasesPage user={user}/>;
}