import { auth } from "@/auth";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function Page() {
  const session = await auth();
  const user = session?.user;
  return <div> User profile page {user?.id}</div>
  //return <UserProfilePage user={user}/>;
}