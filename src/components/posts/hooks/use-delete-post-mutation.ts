import { useToast } from "@/components/ui/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deletePost } from "@/lib/data/posts-data";
import { PostsPageData } from "@/app/api/posts/route";

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
      const queryFilter: QueryFilters<
        InfiniteData<PostsPageData, string | null>
      > = { queryKey: ["post-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPageData, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              next_cursor: page.next_cursor,
              posts: page.posts.filter((p) => p.id !== deletedPost.id),
              total_posts: page.total_posts - 1,
            })),
          };
        }
      );
    },
    onError(error) {
      console.log(error);
    },
  });

  return mutation;
}
