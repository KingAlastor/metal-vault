"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFavoriteArtist } from "@/lib/data/follow-artists-data";

export const useDeleteFavorite = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (bandId: string) => {
      await deleteFavoriteArtist(bandId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favbands"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  const handleDeleteFavoritesClick = (bandId: string) => {
    mutation.mutate(bandId);
  };

  return { handleDeleteFavoritesClick };
};
