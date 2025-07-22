"use client";

import { Button } from "@/components/ui/button";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import UserNameField from "./form-username-input";
import { MultiSelectDropdown } from "@/components/shared/multiselect-dropdown";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CountrySelectDropdown } from "@/components/shared/select-country-dropdown";
import { getGenres } from "@/lib/data/genres-data";
import { useSession, useUser } from "@/lib/session/client-hooks";
import { updateUserData } from "@/lib/data/user-data";
import { useEffect } from "react";

export const FormSchema = z.object({
  user_name: z.string().trim().min(1, "Cannot be empty"),
  location: z.string().optional(),
  genre_tags: z.array(z.string()).optional(),
  excluded_genre_tags: z.array(z.string()).optional(),
});

export default function ProfileSettingsForm() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = useUser(session?.userId);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      user_name: "",
      location: "",
      genre_tags: [],
      excluded_genre_tags: [],
    },
  });

  // Reset form when user data becomes available
  useEffect(() => {
    if (user?.data) {
      form.reset({
        user_name: user.data.user_name || user.data.name || "",
        location: user.data.location || "",
        genre_tags: Array.isArray(user.data.genre_tags)
          ? user.data.genre_tags
          : [],
        excluded_genre_tags: Array.isArray(user.data.excluded_genre_tags)
          ? user.data.excluded_genre_tags
          : [],
      });
    }
  }, [user?.data, form]);

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
    try {
      await updateUserData(data);
      queryClient.invalidateQueries({ queryKey: ["user", session?.userId] });
      toast({ description: "Profile updated." });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "An error occurred. Please try again.",
      });
    }
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {})}
        className="max-w-sm space-y-2.5"
      >
        <UserNameField />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Country</FormLabel>
              <CountrySelectDropdown control={form.control} name="location" />
              <FormDescription>
                Country is used to receive relevant events and band updates
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="genre_tags"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Genres</FormLabel>
              <FormDescription>Add your favorite genres</FormDescription>
              <MultiSelectDropdown
                options={genres || []}
                onChange={field.onChange || ""}
                value={field.value}
                triggerText="Select genres"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="excluded_genre_tags"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Disliked Genres</FormLabel>
              <FormDescription>Add your disliked genres</FormDescription>
              <MultiSelectDropdown
                options={genres || []}
                onChange={field.onChange || ""}
                value={field.value}
                triggerText="Select genres"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </FormProvider>
  );
}
