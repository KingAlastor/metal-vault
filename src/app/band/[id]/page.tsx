import getSession from "@/lib/auth/getSession";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Band",
};

export default async function Page() {
  const session = await getSession();
  const user = session?.user;

  return <div className="text-white">band page</div>;
}
