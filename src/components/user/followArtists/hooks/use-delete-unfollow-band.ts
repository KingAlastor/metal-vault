"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUnfollowBand } from "@/lib/data/user/followArtists/unfollow-artists-data-actions";

export const useDeleteUnfollowedBand = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (bandId: string) => {
      try {
        const result = await deleteUnfollowBand(bandId);
        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unfollowed-bands"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  const handleDeleteUnFollowBandClick = (bandId: string) => {
    mutation.mutate(bandId);
  };

  return { handleDeleteUnFollowBandClick, isLoading: mutation.isPending };
};
