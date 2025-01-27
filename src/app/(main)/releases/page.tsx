import { Metadata } from "next";
import ReleasesPage from "../../../components/releases/releases-page";

export const metadata: Metadata = {
  title: "Releases",
};

export default async function Page() {
  return <ReleasesPage />;
}
