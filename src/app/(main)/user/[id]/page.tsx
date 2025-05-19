 "use server";
 
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function Page() {

  return <> User profile page</>
  //return <UserProfilePage user={user}/>;
}