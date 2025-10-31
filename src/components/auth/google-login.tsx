"use client";

import { GoogleLogin as GoogleOAuthLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function GoogleLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSuccess = async (credentialResponse: any) => {
    // Track sign in
    (window as any).analytics.trackSigninClick?.({ provider: "google" });
    // Send the credential to the server for verification and session creation
    const res = await fetch("/api/auth/google/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential: credentialResponse.credential }),
    });

    if (res.ok) {
      const jsonResponse = await res.json(); // ensure API returns the payload
      queryClient.setQueryData(["session"], jsonResponse.session);
      router.replace("/");
      return;
    } else {
      console.error("Login failed");
      // Handle login failure on the client-side if needed
    }
  };

  const handleError = () => {
    console.log("Login Failed");
  };

  return (
    <GoogleOAuthLogin
      onSuccess={handleSuccess}
      onError={handleError}
      // oneTap can be added here once it works
      shape="pill"
      size="large"
      width="100%"
      theme="outline"
      text="signin_with"
    />
  );
}
