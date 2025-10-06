"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { useApplyReleaseFiltersMutation } from "./hooks/use-apply-filters-mutation";
import { MultiSelectDropdown } from "../shared/multiselect-dropdown";
import { getGenres } from "@/lib/data/genres-data";
import { useSession, useUser } from "@/lib/session/client-hooks";
import { updateUserData } from "@/lib/data/user-data";

const FormSchema = z.object({
  favorite_bands: z.boolean().default(false).optional(),
  favorite_genres: z.boolean().default(false).optional(),
  disliked_genres: z.boolean().default(false).optional(),
  genreTags: z.array(z.string()),
});

interface FiltersFormProps {
  onClose: () => void;
}

export function ReleasesFiltersForm({ onClose }: FiltersFormProps) {
  const { data: session } = useSession();
  const { data: user } = useUser(session?.userId);
  const queryClient = useQueryClient();
  const filters = user?.release_settings || {};
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      favorite_bands: filters?.favorite_bands || false,
      favorite_genres: filters?.favorite_genres || false,
      disliked_genres: filters?.disliked_genres || false,
      genreTags: Array.isArray(filters.genreTags) ? filters.genreTags : [],
    },
  });

  const { setValue, control } = form;

  const mutation = useApplyReleaseFiltersMutation();

  const { data: genres } = useQuery({
    queryKey: ["genreTags"],
    queryFn: async () => {
      const genresData = await getGenres();
      return genresData.map((genre) => ({
        value: genre.genres,
        label: genre.genres,
      }));
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    let filters: {
      favorite_bands: boolean;
      favorite_genres: boolean;
      disliked_genres: boolean;
      genreTags?: string[];
    } = {
      favorite_bands: data.favorite_bands ?? false,
      favorite_genres: data.favorite_genres ?? false,
      disliked_genres: data.disliked_genres ?? false,
    };
    await updateUserData({
      release_settings: filters, 
    });
    queryClient.invalidateQueries({ queryKey: ["user", session?.userId] });

    mutation.mutate();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {})}
        className="w-full space-y-6"
      >
        <>
          <div className="space-y-4 rounded-lg border p-4">
            <FormField
              control={form.control}
              name="favorite_bands"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Show my favorite artists
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="favorite_genres"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Use my favorite genres
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="disliked_genres"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Exclude my disliked genres
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="genreTags"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <MultiSelectDropdown
                      options={genres || []}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                        setValue("genreTags", newValue);
                      }}
                      value={field.value}
                      triggerText="Select genres"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Apply
              </Button>
            </div>
          </div>
        </>
      </form>
    </Form>
  );
}
