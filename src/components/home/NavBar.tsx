"use client";

import Link from "next/link";
import { SignIn } from "../auth/signin-button";
import { UserMenu } from "../auth/user-dropdown-menu";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "../ui/button";
import getSession from "@/lib/auth/getSession";

export default function NavBar() {
  const { data, status} =  useSession();

  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-3">
        <Link href="/" className="flex items-center text-2xl font-bold text-primary">
          <Image src="/logo.svg" alt="Logo" width={28} height={28} className="mr-2"/>
          <p className="font-bold max-xs:hidden"> Metal Vault</p>
        </Link>
        {status === "authenticated" ? (
          <>
            <UserMenu user={data.user} />
          </>
        ) : (
          <SignIn />
        )}
{/*         <UserButton className="sm:ms-auto" /> */}
      </div>
    </header>
  );
};
