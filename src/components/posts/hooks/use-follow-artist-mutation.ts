import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { followArtistByBandId } from "@/lib/data/releases/releases-data-actions";

export function useFollowArtistPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followArtistByBandId,
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
