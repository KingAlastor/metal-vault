import { OAuth2Client } from 'google-auth-library';
import { getSession } from "@/lib/session/server-actions";
import { findOrCreateUser } from "@/lib/data/user-data";
import { NextRequest, NextResponse } from 'next/server';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID);

export async function POST(request: NextRequest) {
  const { credential } = await request.json();
  
  if (!credential) {
    return NextResponse.json({ message: 'No credential provided' }, { status: 400 });
  }

  try {
    // Verify the ID token with Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.name) {
      return NextResponse.json({ message: 'Invalid Google token' }, { status: 400 });
    }

    // Find or create user in your database
    const user = await findOrCreateUser({
      email: payload.email,
      name: payload.name,
      image: payload.picture,
      emailVerified: payload.email_verified,
    });
    
    // Create a session for the user
    const session = await getSession();
    session.userId = user.id;
    session.userShard = user.shard;
    await session.save();

    return NextResponse.json({ message: 'Authentication successful', session }, { status: 200 });

  } catch (error) {
    console.error("Google sign-in error:", error);
    return NextResponse.json({ message: 'Authentication failed' }, { status: 500 });
  }
}