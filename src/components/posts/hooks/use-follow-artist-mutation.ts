import { followArtistByBandId } from "@/lib/data/follow-artists-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useFollowArtistPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bandId: string) => {
      await followArtistByBandId(bandId);
      return bandId; // Return the bandId for use in onMutate and onSuccess
    },
    onMutate: async (bandId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["post-feed"] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(["post-feed"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["post-feed"], (old: any) => {
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) =>
              post.bandId === bandId ? { ...post, isFavorite: true } : post
            ),
          })),
        };
      });
      // Return a context object with the snapshotted value
      return { previousPosts };
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["post-feed"], context?.previousPosts);
    },
    onSuccess: async (bandId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["favbands"] }),
        queryClient.invalidateQueries({ queryKey: ["unfollowed-bands"] }),
      ]);
    },
  });
}
