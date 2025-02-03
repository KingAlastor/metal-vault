import { Metadata } from "next";
import ProfilePage from "@/components/user/profile/profile-page";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function Page() {
  return <ProfilePage />;
}
