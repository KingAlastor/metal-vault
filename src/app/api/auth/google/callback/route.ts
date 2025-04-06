import { getGoogleTokens, getGoogleUserInfo } from "@/lib/auth/google-auth";
import { getSession } from "@/lib/session/server-actions";
import { findOrCreateUser } from "@/lib/data/user-data";

const MAX_SHARDS = 1000;
const USERS_PER_SHARD = 5000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  try {
    // Exchange code for tokens
    const tokens = await getGoogleTokens(code);

    // Get user info
    const userInfo = await getGoogleUserInfo(tokens.access_token!);
    console.log("user info: ", userInfo);

    // Find or create user
    const user = await findOrCreateUser({
      email: userInfo.email,
      name: userInfo.name,
      image: userInfo.picture,
      emailVerified: userInfo.email_verified
    });
    
    // Create session with Iron Session
    const session = await getSession();

    // Store user data in the session
    session.userId = user.id;
    session.userShard = user.shard;
    session.isLoggedIn = true;

    // If you want to store the refresh token (optional)
    if (tokens.refresh_token) {
      session.refreshToken = tokens.refresh_token;
    }

    // Save the session
    await session.save();

    // Redirect to dashboard or home page
    console.log("url", request.url)
    return Response.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("OAuth error:", error);
    return new Response("Authentication failed", { status: 500 });
  }
}
