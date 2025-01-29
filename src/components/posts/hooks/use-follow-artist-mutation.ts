import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followArtistByBandId } from "@/lib/data/releases/releases-data-actions";
import { incrementBandFollowersValue } from "@/lib/data/user/followArtists/follow-artists-data-actions";

export function useFollowArtistPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bandId: string) => {
      await followArtistByBandId(bandId);
      await incrementBandFollowersValue(bandId);
    },
    onSuccess: async () => {
      const queryFilter = { queryKey: ["post-feed"] };

      await queryClient.cancelQueries(queryFilter);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["favbands"] }),
        queryClient.invalidateQueries({ queryKey: ["unfollowed-bands"] }),
      ]);
    },
    onError(error) {
      console.error("Error hiding artist:", error);
    },
  });
}
