"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  decrementBandFollowersValue,
  deleteFavoriteArtist,
} from "@/lib/data/user/followArtists/follow-artists-data-actions";

export const useDeleteFavorite = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (bandId: string) => {
      const result = await deleteFavoriteArtist(bandId);
      if (result.success) {
        await decrementBandFollowersValue(bandId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favbands"] });
    },
  });

  const handleDeleteFavoritesClick = (bandId: string) => {
    mutation.mutate(bandId);
  };

  return { handleDeleteFavoritesClick };
};
