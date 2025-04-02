import { redirect } from 'next/navigation';
import { getGoogleAuthUrl } from '@/lib/auth/google-auth';

export async function GET() {
  const authUrl = await getGoogleAuthUrl();
  return redirect(authUrl);
}