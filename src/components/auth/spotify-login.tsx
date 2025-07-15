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
      className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-3 w-full transition-colors duration-200 shadow-md hover:shadow-lg"
    >
      <img src="/SpotifyLogo.svg" alt="Spotify" className="w-5 h-5" />
      Sign in with Spotify
    </button>
  );
}