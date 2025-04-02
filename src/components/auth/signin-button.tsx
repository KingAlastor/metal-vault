"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SignIn() {
  const router = useRouter();

  return (
    <Button className="button" onClick={() => router.push('/signin')}>
      Sign In
    </Button>
  )
}