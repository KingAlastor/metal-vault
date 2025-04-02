import { getSession } from '@/lib/session/actions'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getSession();
  console.log("session", session);
  if (session.isLoggedIn) {
    return NextResponse.json({
      isLoggedIn: true,
      userId: session.userId,
    })
  }

  return NextResponse.json({
    isLoggedIn: false,
  })
}