"use server"; 

import { OAuth2Client } from 'google-auth-library';

// Create a new OAuth client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.AUTH_GOOGLE_SECRET,
  `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/auth/google/callback`
);

// Generate the authorization URL
export async function getGoogleAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

// Exchange code for tokens
export async function getGoogleTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Get user info with access token
export async function getGoogleUserInfo(access_token: string) {
  oauth2Client.setCredentials({ access_token });
  
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }
  );
  
  return response.json();
}