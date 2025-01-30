import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { hideUserPostsForUserById } from "@/lib/data/posts/posts-data-actions";
import { PostsPageData } from "@/app/api/posts/route";

export function useUnFollowUserPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hideUserPostsForUserById,
    onSuccess: async (userId) => {
      const queryFilter = { queryKey: ["post-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPageData>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              ...page,
              posts: page.posts.filter((post) => post.userId !== userId),
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