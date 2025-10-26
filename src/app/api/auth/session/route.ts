import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session/server-actions';

export async function GET() {
  try {
    const session = await getSession();
    return NextResponse.json({
      userId: session.userId,
      userShard: session.userShard,
      refreshToken: session.refreshToken,
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}