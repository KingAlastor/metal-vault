"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { PostsDataFilters } from "@/lib/data/posts-data";
import { useSession, useUpdateUser, useUser } from "@/lib/session/client-hooks";
import { updateUserData } from "@/lib/data/user-data";

const FormSchema = z.object({
  favorite_bands: z.boolean().default(false).optional(),
  disliked_bands: z.boolean().default(false).optional(),
  favorite_genres: z.boolean().default(false).optional(),
  disliked_genres: z.boolean().default(false).optional(),
});

interface FiltersFormProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export function PostsFiltersForm({ setIsOpen }: FiltersFormProps) {
  const { data: session } = useSession();
  const fullUser = useUser(session?.userId || "");
  const filters = fullUser.data?.posts_settings || {};
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      favorite_bands: filters?.favorite_bands || false,
      disliked_bands: filters?.disliked_bands || false,
      favorite_genres: filters?.favorite_genres || false,
      disliked_genres: filters?.disliked_genres || false,
    },
  });

  const queryClient = useQueryClient();
  const updateUser = useUpdateUser();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    let filters: PostsDataFilters = {
      favorite_bands: data.favorite_bands ?? false,
      disliked_bands: data.disliked_bands ?? false,
      favorite_genres: data.favorite_genres ?? false,
      disliked_genres: data.disliked_genres ?? false,
    };
    setIsOpen(false);
    await updateUser.mutateAsync({ posts_settings: filters });
    // Invalidate cache - this will automatically refetch with new filters
    queryClient.invalidateQueries({ queryKey: ["post-feed"] });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {})}
        className="w-full space-y-6"
      >
        <>
          <div className="space-y-1 rounded-lg border p-2">
            <FormField
              control={form.control}
              name="favorite_bands"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base s-font">
                      <p className="m-font">Show my favorite artists</p>
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
              name="disliked_bands"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base s-font">
                      <p className="m-font">Exclude my unfollowed artists</p>
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
                    <FormLabel className="text-base s-font">
                      <p className="m-font">Use my favorite genres</p>
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
              name="disliked_genres"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base s-font">
                      <p className="m-font">Exclude my disliked genres</p>
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
            <div className="flex justify-end">
              <Button type="submit" className="h-8">
                Apply
              </Button>
            </div>
          </div>
        </>
      </form>
    </Form>
  );
}
