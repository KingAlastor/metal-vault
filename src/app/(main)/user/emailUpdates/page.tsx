import { Metadata } from "next";
import { redirect } from "next/navigation";
import EmailUpdatesPage from "../../../../components/user/emailSettings/email-updates-settings";

export const metadata: Metadata = {
  title: "Email Setup",
};

export default async function Page() {
  return <EmailUpdatesPage />;
}
