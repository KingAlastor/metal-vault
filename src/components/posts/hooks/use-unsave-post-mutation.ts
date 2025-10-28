import { removePostFromSavedPosts } from "@/lib/data/posts-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUnSavePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removePostFromSavedPosts,
    onMutate: async (postId) => {
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
              post.id === postId ? { ...post, is_saved: false } : post
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
  });
}