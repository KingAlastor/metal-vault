import { getFullUserData } from '@/lib/data/user-data';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request
) {
  try {
    const userId = new URL(request.url).pathname.split('/').pop();
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await getFullUserData(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
} 