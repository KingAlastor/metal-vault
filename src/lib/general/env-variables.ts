"use server";

export const fetchEnvironmentVariables = async (
  envKey: string
): Promise<string> => {
  switch (envKey) {
    case "AUTH_SECRET":
      return process.env.AUTH_SECRET || "";
    case "AUTH_GITHUB_ID":
      return process.env.AUTH_GITHUB_ID || "";
    case "AUTH_GITHUB_SECRET":
      return process.env.AUTH_GITHUB_SECRET || "";
    case "AUTH_GOOGLE_ID":
      return process.env.AUTH_GOOGLE_ID || "";
    case "AUTH_GOOGLE_SECRET":
      return process.env.AUTH_GOOGLE_SECRET || "";
    case "YOUTUBE_APIKEY":
      return process.env.YOUTUBE_APIKEY || "";
    case "SPOTIFY_ID":
      return process.env.SPOTIFY_ID || "";
    case "SPOTIFY_SECRET":
      return process.env.SPOTIFY_SECRET || "";
    case "SPOTIFY_SCOPE":
      return process.env.SPOTIFY_SCOPE || "";
    case "SPOTIFY_REDIRECT_URL":
      return process.env.SPOTIFY_REDIRECT_URL || "";
    case "REDIRECT_URI":
      return process.env.REDIRECT_URI || "";
    case "DATABASE_URL":
      return process.env.DATABASE_URL || "";
    case "AWS_ACCESS_KEY":
      return process.env.AWS_ACCESS_KEY || "";
    case "AWS_ACCESS_SECRET":
      return process.env.AWS_ACCESS_SECRET || "";
    case "AWS_SENDER_EMAIL":
      return process.env.AWS_SENDER_EMAIL || "";
    case "AWS_REGION":
      return process.env.AWS_REGION || "";
    case "BEARER_TOKEN": 
      return process.env.BEARER_TOKEN || "";
    default:
      throw new Error(`Unknown environment variable key: ${envKey}`);
  }
};
