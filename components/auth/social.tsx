"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const Social = () => {
const onClick = (provider: "Google" | "GitHub") => {
  signIn(provider, {
    callbackUrl: DEFAULT_LOGIN_REDIRECT,
  });
}

  return (
    <div className="flex items-center w-full gap-x-2">
      <Button
        size="lg"
        className="w-full bg-gray-500"
        variant="outline"
        onClick={() => onClick("Google")}
      >
        <FcGoogle />
      </Button>
      <Button
        size="lg"
        className="w-full bg-gray-500"
        variant="outline"
        onClick={() => onClick("GitHub")}
      >
        <FaGithub />
      </Button>
    </div>
  );
};