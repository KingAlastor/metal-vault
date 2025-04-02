import { redirect } from 'next/navigation';
import { getSpotifyAuthUrl } from '@/lib/auth/spotify-auth';

export async function GET() {
  const authUrl = await getSpotifyAuthUrl();
  return redirect(authUrl);
} 