'use client';

import { useQuery } from '@tanstack/react-query';
import { SessionData } from './config';

/**
 * Client-side hook to get the current session
 * Uses React Query to cache and manage the session state
 */
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/session');
      if (!res.ok) throw new Error('Failed to fetch session');
      const data = await res.json();
      return {
        isLoggedIn: data.isLoggedIn,
        userId: data.userId,
        userShard: data.userShard,
        refreshToken: data.refreshToken,
      } as SessionData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Client-side hook to get user data
 * Uses React Query to cache and manage the user state
 */
export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    enabled: !!userId,
  });
} 