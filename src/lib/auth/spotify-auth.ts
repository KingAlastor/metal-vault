'use server';

// Generate the authorization URL
export async function getSpotifyAuthUrl() {
  const scopes = [
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_ID!,
    scope: scopes,
    redirect_uri: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/auth/spotify/callback`,
    show_dialog: 'true'
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Exchange code for tokens
export async function getSpotifyTokens(code: string) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/auth/spotify/callback`,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_ID}:${process.env.SPOTIFY_SECRET}`
      ).toString('base64')}`,
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to get tokens');
  }

  return response.json();
}

// Get user info with access token
export async function getSpotifyUserInfo(access_token: string) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  return response.json();
} 