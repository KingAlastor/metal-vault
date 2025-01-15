import { EventsPageData } from "@/app/api/events/route";
import { useToast } from "@/components/ui/use-toast";
import { addEvent } from "@/lib/data/events/events-data-actions";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function useSubmitEventMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addEvent,
    onSuccess: async (newEvent) => {
      const queryFilter: QueryFilters<
        InfiniteData<EventsPageData>
      > = { queryKey: ["events-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<EventsPageData>>(
        queryFilter,
        (oldData): InfiniteData<EventsPageData> | undefined => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  events: [newEvent, ...firstPage.events],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
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
