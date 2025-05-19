"use server";

import { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminPage from "../../../../components/user/admin/admin-page";
import { getSession } from "@/lib/session/server-actions";
import { getFullUserData } from "@/lib/data/user-data";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function Page() {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }

  const userData = await getFullUserData(session.userId);
  if (userData?.role !== "admin") {
    return (
      <main>
        <p className="text-center">You are not authorized to view this page</p>
      </main>
    );
  }

  return <AdminPage />;
}
