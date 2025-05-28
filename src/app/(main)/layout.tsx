import NavBar from "@/app/(main)/NavBar";
import MenuBar from "./MenuBar";
import PromotionsBar from "./PromotionsBar";
import { Toaster } from "@/components/ui/toaster";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <div className="mx-auto flex w-full max-w-7xl grow gap-0 lg:gap-5 p-0 lg:p-5">
        <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm lg:block lg:px-5 xl:w-80" />
        <div className="flex-1 min-w-0 w-full">{children}</div>
        <Toaster />
        <PromotionsBar className="sticky top-[5.25rem] hidden lg:block w-full max-w-xs" />
      </div>
      <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 lg:hidden" />
    </div>
  );
}
