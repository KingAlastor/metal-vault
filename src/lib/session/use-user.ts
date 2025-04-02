'use client';

import { useQuery } from '@tanstack/react-query'
import { FullUser } from '@/lib/data/user'

export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID')
      const res = await fetch(`/api/users/${userId}`)
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json() as Promise<FullUser>
    },
    enabled: !!userId, 
  })
}
