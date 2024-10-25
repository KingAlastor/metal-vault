import getSession from "@/lib/auth/getSession";

import { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfilePage from "@/components/user/profile/ProfilePage";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function Page() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect("/api/auth/signin?callbackUrl=/settings");
  }

  return <ProfilePage user={user} />;
}