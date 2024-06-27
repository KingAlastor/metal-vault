import getSession from "@/lib/auth/getSession";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminPage from "./AdminPage";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function Page() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }

  if (user.role !== "admin") {
    return (
      <main className="mx-auto my-10">
        <p className="text-center">You are not authorized to view this page</p>
      </main>
    );
  }

  return (
    <AdminPage />
  );
}