import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { decrementBandFollowersValue, deleteFavoriteArtist } from "@/lib/data/user/followArtists/follow-artists-data-actions";

export function useUnFollowArtistPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bandId: string) => {
      const result = await deleteFavoriteArtist(bandId);
      if (result.success) {
        await decrementBandFollowersValue(bandId);
      }
    },    onSuccess: async () => {
      const queryFilter = { queryKey: ["post-feed"] };

      await queryClient.cancelQueries(queryFilter);
      queryClient.invalidateQueries({ queryKey: ["favbands"] });
    },
    onError(error) {
      console.error("Error hiding artist:", error);
    },
  });
}
