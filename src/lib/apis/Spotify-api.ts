"use server";

import axios from "axios";

export const fetchSpotifyData = async (spotifyLink: string) => {
  const accessToken = await getAccessToken();
  console.log("access token: ", accessToken);

  const { id, type } = extractSpotifyIdAndType(spotifyLink);
  console.log("spotify ID and type: ", id, type);

  if (!type || !id) {
    throw new Error("Invalid Spotify link");
  }

  const url = `https://api.spotify.com/v1/${type}s/${id}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  console.log(response.data);

  console.log("album name: ", response.data.album.name);
  console.log("artist name: ", response.data.artists[0].name);
  console.log("release date: ", response.data.album.release_date);
  console.log("image url: ", response.data.album.images[1].url);
  console.log("prev url: ", response.data.preview_url);

  return {
    data: response.data,
    type,
  };
};

const getAccessToken = async () => {
  const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

  const response = await axios.post(
    TOKEN_ENDPOINT,
    new URLSearchParams({
      grant_type: "client_credentials",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_ID}:${process.env.SPOTIFY_SECRET}`
        ).toString("base64")}`,
      },
    }
  );

  return response.data.access_token;
};

const extractSpotifyIdAndType = (spotifyLink: string) => {
  const albumRegex = /album\/([a-zA-Z0-9]+)/;
  const trackRegex = /track\/([a-zA-Z0-9]+)/;
  const artistRegex = /artist\/([a-zA-Z0-9]+)/;

  let match = spotifyLink.match(albumRegex);
  if (match) {
    return { type: "album", id: match[1] };
  }

  match = spotifyLink.match(trackRegex);
  if (match) {
    return { type: "track", id: match[1] };
  }

  match = spotifyLink.match(artistRegex);
  if (match) {
    return { type: "artist", id: match[1] };
  }

  return { type: null, id: null };
};
