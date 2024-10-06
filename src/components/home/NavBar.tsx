"use client";

import Link from "next/link";
import { SignIn } from "../auth/signin-button";
import { UserMenu } from "../auth/user-dropdown-menu";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "../ui/button";

export const NavBar = () => {
  const { status, data } = useSession();

  return (
    <nav className="navbar">
      <Link href="/" className="flex items-center gap-4">
        <Image src="/logo.svg" alt="Logo" width={28} height={28} />
        <p className="font-bold max-xs:hidden"> Metal Vault</p>
      </Link>
      <div className="flex">
        <Button variant="outline">
          <Link href="/post">
            <span className="dropdown-options">Create Post</span>
          </Link>
        </Button>
        {status === "authenticated" ? (
          <>
            <UserMenu user={data.user} />
          </>
        ) : (
          <SignIn />
        )}
      </div>
    </nav>
  );
};
