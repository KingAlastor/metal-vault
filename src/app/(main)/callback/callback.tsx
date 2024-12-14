"use server";

import axios from "axios";

const CLIENT_ID = process.env.SPOTIFY_ID;
const CLIENT_SECRET = process.env.SPOTIFY_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URL;

export const handleSpotifyFollowersCallback = async (code: string) => {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "authorization_code",
      code: code as string,
      redirect_uri: REDIRECT_URI || "",
      client_id: CLIENT_ID || "",
      client_secret: CLIENT_SECRET || "",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data;
};
