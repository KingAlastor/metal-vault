import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteEvent } from "@/lib/data/events/events-data-actions";

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [["events-feed"], ["user-events"]],
      });
    },
    onError(error) {
      console.log(error);
    },
  });

  return mutation;
}
