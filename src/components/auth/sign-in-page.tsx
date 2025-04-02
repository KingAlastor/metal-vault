'use client';
import { GoogleLogin } from "@/components/auth/google-login";
import { SpotifyLogin } from "@/components/auth/spotify-login";

export default function CustomOAuthSignIn() {

  return (
    <div>
      <h1>My Custom Sign In page</h1>
      <GoogleLogin />
      <SpotifyLogin />
    </div>
  );
}
