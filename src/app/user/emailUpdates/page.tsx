import getSession from "@/lib/auth/getSession";

import { Metadata } from "next";
import { redirect } from "next/navigation";
import EmailUpdatesPage from "./EmailUpdatesPage";

export const metadata: Metadata = {
  title: "Email Setup",
};

export default async function Page() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect("/api/auth/signin?callbackUrl=/user/emailUpdates");
  }

  return <EmailUpdatesPage user={user} />;
}