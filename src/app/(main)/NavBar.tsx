"use client";

import Link from "next/link";
import { SignIn } from "../../components/auth/signin-button";
import { UserMenu } from "../../components/auth/user-dropdown-menu";
import Image from "next/image";
import { useSession } from "@/lib/session/client-hooks";

export default function NavBar() {
  const { data: session } = useSession();
  console.log("navbar session fetch: ", session)

  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-1.5 py-1.5">
        <Link
          href="/"
          className="flex items-center text-2xl font-bold text-primary"
        >
          <Image
            src="/Logo.svg"
            alt="Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <p className="font-bold max-xs:hidden"> Metal Vault</p>
        </Link>
        {!!session?.userId ? (
          <>
            <UserMenu />
          </>
        ) : (
          <SignIn />
        )}
      </div>
    </header>
  );
}
