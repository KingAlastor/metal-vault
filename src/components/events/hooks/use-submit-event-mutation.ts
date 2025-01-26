import { useToast } from "@/components/ui/use-toast";
import { addOrUpdateEvent } from "@/lib/data/events/events-data-actions";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function useSubmitEventMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addOrUpdateEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["events-feed"],
      });

      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    },
  });

  return mutation;
}
