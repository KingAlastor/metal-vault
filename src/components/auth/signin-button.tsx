"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth/auth-client";

export function SignIn() {
  return (
    <Button className="button" onClick={() => signIn.social({ provider: "google", callbackURL: "/" })}>
      Sign In
    </Button>
  )
}