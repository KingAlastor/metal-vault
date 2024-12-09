import NavBar from "@/app/(main)/NavBar";
import getSession from "@/lib/auth/getSession";
import MenuBar from "./MenuBar";
import { SessionProvider } from "next-auth/react";
import PromotionsBar from "./PromotionsBar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
          <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80" />
          <div className="flex-1">{children}</div>
          <PromotionsBar className="sticky top-[5.25rem] hidden sm:block w-full max-w-xs" />
        </div>
        <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
      </div>
    </SessionProvider>
  );
}
