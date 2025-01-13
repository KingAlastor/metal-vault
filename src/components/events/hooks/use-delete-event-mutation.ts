import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteEvent } from "@/lib/data/events/events-data-actions";
import { EventsPageData } from "@/app/api/events/route";

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: async (deletedPost) => {
      const queryFilter: QueryFilters<
        InfiniteData<EventsPageData, string | null>
      > = { queryKey: ["post-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<EventsPageData, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              events: page.events.filter((e) => e.id !== deletedPost.id),
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
