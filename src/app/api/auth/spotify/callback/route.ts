import { getSpotifyTokens, getSpotifyUserInfo } from "@/lib/auth/spotify-auth";
import { getSession } from "@/lib/session/actions";
import sql from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  try {
    // Exchange code for tokens
    const tokens = await getSpotifyTokens(code);
    console.log("spotify tokens:", tokens);

    // Get user info
    const userInfo = await getSpotifyUserInfo(tokens.access_token);
    console.log("spotify user info: ", userInfo);

    // Find or create user in your database
    let user;
    try {
      user = await sql`
      SELECT * FROM users WHERE email = ${userInfo.email}
      `;
    } catch (error) {
      console.error("Error querying user from database:", error);
      throw new Error("Failed to fetch user");
    }

    if (user.length === 0) {
      console.log("entering if");
      try {
        user = await sql`
          INSERT INTO users 
          (email, name, image, email_verified, role) 
          VALUES (${userInfo.email}, ${userInfo.display_name}, ${userInfo.images?.[0]?.url}, ${true}, ${'user'}) 
          RETURNING *;
        `;
      } catch (error) {
        console.error("Error inserting user into database:", error);
        throw new Error("Failed to create user");
      }
    }
    console.log("user: ", user);
    // Create session with Iron Session
    const session = await getSession();

    // Store minimal data in the session
    session.userId = user[0].id;
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