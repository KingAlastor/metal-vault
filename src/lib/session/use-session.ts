'use client';

import { useQuery } from '@tanstack/react-query';

interface Session {
  isLoggedIn: boolean;
  userId?: string;
}

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/session');
      if (!res.ok) throw new Error('Failed to fetch session');
      return res.json() as Promise<Session>;
    },
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: true, 
  });
} 