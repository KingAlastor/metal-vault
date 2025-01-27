import { auth } from "@/auth";

import { Metadata } from "next";
import { redirect } from "next/navigation";
import EmailUpdatesPage from "../../../../components/user/emailSettings/email-updates-settings";

export const metadata: Metadata = {
  title: "Email Setup",
};

export default async function Page() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/api/auth/signin?callbackUrl=/user/emailUpdates");
  }

  return <EmailUpdatesPage user={user} />;
}