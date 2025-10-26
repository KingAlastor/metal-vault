import { getSpotifyTokens, getSpotifyUserInfo } from "@/lib/auth/spotify-auth";
import { getSession } from "@/lib/session/server-actions";
import { findOrCreateUser } from "@/lib/data/user-data";
import { saveRefreshTokenToUserTokens } from "@/lib/data/callback-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const isPopup = searchParams.get("popup") === "true";

  // Handle errors for popup flow
  if (error && isPopup) {
    return Response.redirect(new URL(`/auth/spotify/popup-success?error=${encodeURIComponent(error)}`, request.url));
  }

  if (!code) {
    if (isPopup) {
      return Response.redirect(new URL(`/auth/spotify/popup-success?error=${encodeURIComponent("No authorization code provided")}`, request.url));
    }
    return new Response("No code provided", { status: 400 });
  }
  try {
    // Exchange code for tokens
    const tokens = await getSpotifyTokens(code);
    if (isPopup) {
      const successUrl = new URL('/auth/spotify/popup-success', request.url);
      successUrl.searchParams.set('token', tokens.access_token);
      if (tokens.refresh_token) {
        successUrl.searchParams.set('refreshToken', tokens.refresh_token);
      }
      return Response.redirect(successUrl);
    }

    // Regular login flow - create session and redirect
    // Get user info
    const userInfo = await getSpotifyUserInfo(tokens.access_token);

    // Find or create user
    const user = await findOrCreateUser({
      email: userInfo.email,
      name: userInfo.display_name,
      image: userInfo.images?.[0]?.url,
      emailVerified: true,
    });

    await saveRefreshTokenToUserTokens("spotify", tokens.refresh_token);

    // Create session
    const session = await getSession();

    // Store user data in the session
    session.userId = user.id;
    session.userShard = user.shard;

    // Store the refresh token 
    if (tokens.refresh_token) {
      session.refreshToken = tokens.refresh_token;
    }

    // Save the session
    await session.save();

    // Redirect to dashboard or home page
    return Response.redirect(new URL("/", request.url));  } catch (error) {
    console.error("OAuth error:", error);
    
    if (isPopup) {
      return Response.redirect(new URL(`/auth/spotify/popup-success?error=${encodeURIComponent("Failed to exchange authorization code for tokens")}`, request.url));
    }
    
    return new Response("Authentication failed", { status: 500 });
  }
}
