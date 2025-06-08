'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SpotifyPopupSuccessPage() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      // Send error message to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: "AUTH_ERROR",
          error: error
        }, "*");
      }
    } else if (token) {
      // Send success message to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: "AUTH_COMPLETE",
          token: token,
          refreshToken: refreshToken
        }, "*");
      }
    }

    // Close the popup window after a short delay
    setTimeout(() => {
      window.close();
    }, 1000);
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Successfully connected to Spotify!
        </h2>
        <p className="text-gray-600">
          This window will close automatically...
        </p>
      </div>
    </div>
  );
}
