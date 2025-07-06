import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getReleasesByFilters } from "@/lib/data/release-filters-data";

export function useApplyReleaseFiltersMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: getReleasesByFilters,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["releases"],
      });

      toast({
        title: "Success",
        description: "Fetched filtered events",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to apply filters",
        variant: "destructive",
      });
    },
  });

  return mutation;
}
