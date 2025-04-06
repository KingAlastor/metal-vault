import { PostsPageData } from "@/app/api/posts/route";
import { useToast } from "@/components/ui/use-toast";
import { addOrUpdatePost } from "@/lib/data/posts-data";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function useSubmitPostMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addOrUpdatePost,
    onSuccess: async (newPost) => {
      const queryFilter: QueryFilters<
        InfiniteData<PostsPageData, string | null>
      > = { queryKey: ["post-feed"] };
      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPageData, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return oldData;
      
          let postUpdated = false;

          // Loop through posts to find an already existing post and update
          const updatedPages = oldData.pages.map(page => {
            const updatedPosts = page.posts.map(post => {
              if (post.id === newPost.id) {
                postUpdated = true;
                return { ...post, ...newPost };
              }
              return post;
            });
      
            return {
              ...page,
              posts: updatedPosts,
            };
          });
      
          // If the post wasn't found and updated, add it to the beginning of the first page
          if (!postUpdated && updatedPages.length > 0) {
            updatedPages[0] = {
              ...updatedPages[0],
              posts: [newPost, ...updatedPages[0].posts],
            };
          }
      
          return {
            ...oldData,
            pages: updatedPages,
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });

      toast({
        description: "Post created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
      });
    },
  });

  return mutation;
}
