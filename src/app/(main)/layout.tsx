import NavBar from "@/app/(main)/NavBar";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import MenuBar from "./MenuBar";
import PromotionsBar from "./PromotionsBar";
import { Toaster } from "@/components/ui/toaster";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
        <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80" />
        <div className="flex-1">{children}</div>
        <Toaster />
        <PromotionsBar className="sticky top-[5.25rem] hidden sm:block w-full max-w-xs" />
      </div>
      <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
    </div>
  );
}
