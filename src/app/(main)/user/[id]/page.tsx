import getSession from "@/lib/auth/getSession";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function Page() {
  const session = await getSession();
  const user = session?.user;
  return <div> User profile page {user?.id}</div>
  //return <UserProfilePage user={user}/>;
}