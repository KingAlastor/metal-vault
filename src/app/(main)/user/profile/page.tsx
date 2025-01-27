import { auth } from "@/auth";

import { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfilePage from "@/components/user/profile/profile-page";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function Page() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/api/auth/signin?callbackUrl=/settings");
  }

  return <ProfilePage user={user} />;
}