"use client"; 

export const extractYTID = (link: string) => {
  const regExp =
    /(?:https?:\/\/)?(?:www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = regExp.exec(link);
  if (match && match[2]) {
    const videoId = match[2];
    return videoId;
  } else {
    console.error("No match found for YT link");
    return null;
  }
};

const extractSpotifyID = (link: string) => {
  const regExp =
    /(?:https?:\/\/)?(?:open\.spotify\.com\/)(track|album|playlist)\/([a-zA-Z0-9]{22})/;
  const match = regExp.exec(link);
  if (match && match[2]) {
    return { type: match[1], id: match[2] };
  } else {
    console.error("No match found for Spotify link");
    return null;
  }
};
