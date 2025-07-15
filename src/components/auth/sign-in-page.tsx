"use client";
import { GoogleLogin } from "@/components/auth/google-login";
import { SpotifyLogin } from "@/components/auth/spotify-login";

export default function CustomOAuthSignIn() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screenp-4">
      <div className="space-y-4">
        <GoogleLogin />
        <SpotifyLogin />
      </div>
    </div>
  );
}
