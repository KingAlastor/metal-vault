"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { handleSpotifyFollowersCallback } from "./callback";
import { saveRefreshTokenToUserTokens } from "@/lib/data/callback/callback-data-actions";

export default function Callback() {
  const searchParams = useSearchParams();
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    const handleCode = async () => {
      const code = searchParams.get("code");
      const service = searchParams.get("service");

      if (code && service) {
        if (service === "spotifyUser") {
          // Handle Spotify authorization code
          const existingAccessToken = sessionStorage.getItem(
            "spotify_access_token"
          );
          if (!existingAccessToken) {
            console.log("loading function again");
            const response = await handleSpotifyFollowersCallback(code);
            sessionStorage.setItem(
              "spotify_access_token",
              response.access_token
            );
            await saveRefreshTokenToUserTokens(
              "spotify",
              response.refresh_token
            );

            const token = response.access_token;
            const origin =
              typeof window !== "undefined" ? window.location.origin : "";
            window.opener.postMessage({ type: "AUTH_COMPLETE", token }, origin);
          }
          window.close();
        }
      }
    };

    if (!hasExecutedRef.current) {
      hasExecutedRef.current = true;
      handleCode();
    }
  }, [searchParams]);

  return <div>Processing your login...</div>;
}
