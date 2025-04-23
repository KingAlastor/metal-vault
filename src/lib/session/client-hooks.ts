'use client';

import { useQuery } from '@tanstack/react-query';
import { SessionData } from './config';
import kyInstance from '../ky';
import { FullUser, updateUserData } from '../data/user-data';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateUserData } from '../data/user-data';

/**
 * Client-side hook to get the current session
 * Uses React Query to cache and manage the session state
 */
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const data = await kyInstance.get('/api/auth/session').json<SessionData>();
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
      return kyInstance.get(`/api/users/${userId}`).json<FullUser>();
    },
    enabled: !!userId,
  });
}

/**
 * Client-side hook to update user data
 * Uses React Query to invalidate and update the user cache
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserData) => {
      // Call the server action directly
      const updatedUser = await updateUserData(data);
      
      if (!updatedUser) {
        throw new Error("Failed to update user data");
      }
      
      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', updatedUser.id], (oldData: FullUser | undefined) => {
        if (!oldData) return updatedUser; 
        return {
          ...oldData,
          ...updatedUser, 
        };
      });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
}