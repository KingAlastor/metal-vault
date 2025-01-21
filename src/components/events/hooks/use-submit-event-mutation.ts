import { useToast } from "@/components/ui/use-toast";
import { addEvent } from "@/lib/data/events/events-data-actions";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function useSubmitEventMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [["events-feed"], ["user-events"]],
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
