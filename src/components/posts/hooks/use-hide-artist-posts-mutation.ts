import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { PostsPageData } from "@/app/api/posts/route";
import { hideArtistForUserById } from "@/lib/data/posts-data";

export function useHideArtistPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hideArtistForUserById,
    onSuccess: async (response) => {
      const queryFilter = { queryKey: ["post-feed"] };

      await queryClient.cancelQueries(queryFilter);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["favbands"] }),
        queryClient.invalidateQueries({ queryKey: ["unfollowed-bands"] }),
      ]);

      queryClient.setQueriesData<InfiniteData<PostsPageData>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              ...page,
              posts: page.posts.filter((p) => p.band_id !== response.band_id),
            })),
          };
        }
      );
    },
    onError(error) {
      console.error("Error hiding artist:", error);
    },
  });
}
