'use client';

import { GoogleLogin as GoogleOAuthLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

export function GoogleLogin() {
  const router = useRouter();

  const handleSuccess = async (credentialResponse: any) => {
    // Send the credential to your server for verification and session creation
    const res = await fetch('/api/auth/google/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential: credentialResponse.credential }),
    });

    if (res.ok) {
      // Force a full page reload to ensure all server components re-render
      window.location.href = '/';
    } else {
      console.error('Login failed');
      // Handle login failure on the client-side if needed
    }
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  return (
    <GoogleOAuthLogin
      onSuccess={handleSuccess}
      onError={handleError}
      // oneTap can be added here once it works
      shape="pill"
      size="large"
      width="100%"
      theme="outline"
      text="signin_with"
    />
  );
}