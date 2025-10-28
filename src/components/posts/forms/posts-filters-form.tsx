"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { PostsDataFilters } from "@/lib/data/posts-data";
import { useUpdateUser, useUser } from "@/lib/session/client-hooks";
import { useSessionContext } from "@/app/SessionProvider";

const FormSchema = z.object({
  favorite_bands: z.boolean().default(false).optional(),
  favorite_genres: z.boolean().default(false).optional(),
  disliked_genres: z.boolean().default(false).optional(),
});

interface FiltersFormProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export function PostsFiltersForm({ setIsOpen }: FiltersFormProps) {
  const { session: session } = useSessionContext();
  const fullUser = useUser(session?.userId || "");
  const filters = fullUser.data?.posts_settings || {};

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      favorite_bands: filters?.favorite_bands || false,
      favorite_genres: filters?.favorite_genres || false,
      disliked_genres: filters?.disliked_genres || false,
    },
  });

  const queryClient = useQueryClient();
  const updateUser = useUpdateUser();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    let filters: PostsDataFilters = {
      favorite_bands: data.favorite_bands ?? false,
      favorite_genres: data.favorite_genres ?? false,
      disliked_genres: data.disliked_genres ?? false,
    };
    setIsOpen(false);
    await updateUser.mutateAsync({ posts_settings: filters });

    await queryClient.removeQueries({ queryKey: ["post-feed"], exact: true });
    await queryClient.invalidateQueries({
      queryKey: ["post-feed"],
      refetchType: "active",
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {})}
        className="w-full space-y-6"
      >
        <>
          <div className="space-y-1 rounded-lg border p-2">
            {!session?.userId && <p>Log in to use filters</p>}
            <FormField
              control={form.control}
              name="favorite_bands"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel
                      className={`text-base ${
                        !session?.userId ? "text-gray-400" : ""
                      }`}
                    >
                      <p className="m-font">Show my favorite artists</p>
                    </FormLabel>
                    <FormDescription>
                      Favorites override any genre filters
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!session?.userId}
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
                    <FormLabel
                      className={`text-base ${
                        !session?.userId ? "text-gray-400" : ""
                      }`}
                    >
                      <p className="m-font">Use my favorite genres</p>
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!session?.userId}
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
                    <FormLabel
                      className={`text-base ${
                        !session?.userId ? "text-gray-400" : ""
                      }`}
                    >
                      <p className="m-font">Exclude my disliked genres</p>
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!session?.userId}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                className="h-8"
                disabled={form.formState.isSubmitting || !session?.userId}
              >
                Apply
              </Button>
            </div>
          </div>
        </>
      </form>
    </Form>
  );
}
