"use server";

import axios from "axios";

export const fetchSpotifyData = async (spotifyLink: string) => {
  const accessToken = await getAccessToken();
  console.log("access token: ", accessToken);

  const { id, type } = extractSpotifyIdAndType(spotifyLink);

  if (!type || !id) {
    throw new Error("Invalid Spotify link");
  }

  const url = `https://api.spotify.com/v1/${type}s/${id}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

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

export const fetchSpotifyBandTopTracks = async (id: string) => {
  const accessToken = await getAccessToken();
  console.log("id", id, "accesstoken: ", accessToken);
  const url = `https://api.spotify.com/v1/artists/${id}/top-tracks`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  console.log("fetch top tracks: ", response.data);
  return response.data;
};

export const refreshSpotifyAccessToken = async (refreshToken: string) => {
  const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
  const response = await axios.post(
    TOKEN_ENDPOINT,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
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

export type Artist = {
  name: string;
  spotifyID: string;
};

export const getFollowedArtistsFromSpotify = async (token: string) => {
  let artists: Artist[] = [];
  let nextUrl = "https://api.spotify.com/v1/me/following?type=artist&limit=50";

  while (nextUrl) {
    const response = await axios.get(nextUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { items, next } = response.data.artists;

    for (let i = 0; i < items.length; i++) {
      const artist = {
        name: items[i].name,
        spotifyID: items[i].id,
      };
      artists.push(artist);
    }
    nextUrl = next;
  }
  console.log("artists");
  return artists;
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
