import { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminPage from "../../../../components/user/admin/admin-page";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function Page() {
  const { user } =
    (await auth.api.getSession({ headers: await headers() })) ?? {};

  if (!user) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }

  if (user.role !== "admin") {
    return (
      <main>
        <p className="text-center">You are not authorized to view this page</p>
      </main>
    );
  }

  return <AdminPage />;
}
