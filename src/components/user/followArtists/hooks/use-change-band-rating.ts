import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBandRating } from "@/lib/data/user/followArtists/follow-artists-data-actions";

export function useChangeBandRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bandId, rating }: { bandId: string; rating: number }) => {
      await updateBandRating(bandId, rating);
      return { bandId, rating };
    },
    onMutate: async ({ bandId, rating }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["favbands"] });

      // Snapshot the previous value
      const previousBands = queryClient.getQueryData(["favbands"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["favbands"], (old: any) => {
        if (!old) return old;
    
        console.log("Updating bandId:", bandId, "with rating:", rating);
    
        const updatedData = old.map((band: any) => {
          if (band.id === bandId) {
            const updatedBand = { ...band, rating: rating };
            console.log("Updated band:", updatedBand);
            return updatedBand;
          }
          return band;
        });
    
        return updatedData;
      });

      // Return a context object with the snapshotted value
      return { previousBands };
    },
    onError: (err, { bandId, rating }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["favbands"], context?.previousBands);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favbands"] });
    },
  });
}