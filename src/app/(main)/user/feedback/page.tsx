import { Metadata } from "next";
import FeedbackPage from "@/components/user/feedback/feedback-page";

export const metadata: Metadata = {
  title: "Feedback",
};

export default async function Page() {
  return <FeedbackPage />;
}
