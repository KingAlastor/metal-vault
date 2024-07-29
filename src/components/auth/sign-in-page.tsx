"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div>
      Sign in with:
      <Button
        className="button"
        onClick={() => signIn("google", { redirectTo: "/" })}
      >
        Google
      </Button>
    </div>
  );
}
