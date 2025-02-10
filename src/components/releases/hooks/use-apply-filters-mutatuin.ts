import { useToast } from "@/components/ui/use-toast";
import { getReleasesByFilters, ReleasesFilters } from "@/lib/data/releases/releases-filters-data-actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useApplyReleaseFiltersMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (filters: ReleasesFilters) => getReleasesByFilters(filters),
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
