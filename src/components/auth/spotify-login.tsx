'use client';

import { useRouter } from 'next/navigation';

export function SpotifyLogin() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/api/auth/spotify');
  };

  return (
    
    <button 
      onClick={handleLogin}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
      Sign in with Spotify
    </button>
  );
}