"use client";

import Link from "next/link";
import { SignIn } from "../auth/signin-button";
import { SignOut } from "../auth/signout-button";
import { useSession } from "next-auth/react";
import Image from "next/image";

export const NavBar = () => {
  const { status, data } = useSession();

  return (
    <nav className="navbar">
      <Link href="/" className="flex items-center gap-4">
        <Image src="/logo.svg" alt="Logo" width={28} height={28} />
        <p className="font-bold max-xs:hidden"> Metal Vault</p>
      </Link>
      <div>
        {status === "authenticated" ? (
          <>
            <span>{data.user?.name}</span>
            <SignOut />
          </>
        ) : (
          <SignIn />
        )}
      </div>
    </nav>
  );
};