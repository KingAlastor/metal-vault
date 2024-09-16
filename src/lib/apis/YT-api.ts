"use server";

import axios from "axios";

export const fetchYoutubeVideoData = async (videoId: string) => {
  const apiKey = process.env.YOUTUBE_APIKEY;
  console.log("API Key:", apiKey); // Verify the API key
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&fields=items(snippet(title,description,thumbnails(default,medium,high,standard,maxres)))&part=snippet`;
  console.log(url);

  try {
    const response = await axios.get(url, {
      headers: {
        Referer: "localhost:3000", 
      },
    });
    const data = response.data;
    console.log(data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error message:", error.message);
      console.error("Axios error response:", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};