"use server";

import axios from "axios";

export const fetchYoutubeVideoData = async (videoId: string) => {
  const apiKey = process.env.YOUTUBE_APIKEY;
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}` +
              `&key=${apiKey}` +
              `&fields=items(snippet(title,description,publishedAt,thumbnails(default,medium,high,standard,maxres)))` +
              `&part=snippet`;
              
  try {
    const response = await axios.get(url, {
      headers: {
        Referer: "localhost:3000",
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error("No video data found for the provided video ID.");
    }

    const data = response.data.items[0].snippet;
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error message:", error.message);
      console.error("Axios error response:", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
    throw new Error(`Failed to fetch YouTube video data: ${error instanceof Error ? error.message : String(error)}`);
  }
};
