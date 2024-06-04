"use client";

import { SignIn } from "../auth/signin-button";
import { SignOut } from "../auth/signout-button";
import { useSession } from "next-auth/react";

export const NavBar = () => {
  const { status, data } = useSession();

  return (
    <nav>
      <div className="bg-gray-800 flex justify-end">
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
