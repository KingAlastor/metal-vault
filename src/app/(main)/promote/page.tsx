import PromoteFormPage from "@/components/promote/promote-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promote",
};
export default function Home() {
  return <PromoteFormPage />;
}
