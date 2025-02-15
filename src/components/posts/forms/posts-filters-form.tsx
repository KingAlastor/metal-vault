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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostsDataFilters } from "../post-types";
import { authClient } from "@/lib/auth/auth-client";

const FormSchema = z.object({
  favorites_only: z.boolean().default(false).optional(),
  favorite_genres_only: z.boolean().default(false).optional(),
  unique_bands: z.boolean().default(false).optional(),
});

interface FiltersFormProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  filters: any;
  setFilters: Dispatch<SetStateAction<PostsDataFilters>>;
}

export function PostsFiltersForm({
  setIsOpen,
  filters,
  setFilters,
}: FiltersFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      favorites_only: filters?.favorites_only || false,
      favorite_genres_only: filters?.favorite_genres_only || false,
      unique_bands: filters?.unique_bands || false,
    },
  });

  const queryClient = useQueryClient();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    let filters: PostsDataFilters = {
      favorites_only: data.favorites_only ?? false,
      favorite_genres_only: data.favorite_genres_only ?? false,
      unique_bands: data.unique_bands ?? false,
    };
    setIsOpen(false);
    setFilters(filters);
    await authClient.updateUser({
      postsSettings: JSON.stringify(filters),
    });
    queryClient.invalidateQueries({ queryKey: ["post-feed"] });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Form validation failed:", errors);
          console.log("Current form values:", form.getValues());
        })}
        className="w-full space-y-6"
      >
        <>
          <div className="space-y-1 rounded-lg border p-2">
            <FormField
              control={form.control}
              name="favorites_only"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Only show my favorite artists
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
              name="favorite_genres_only"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Only show my favorite genres
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
              name="unique_bands"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Show unique band posts
                    </FormLabel>
                    <FormDescription>
                      Show only one band post per feed
                    </FormDescription>
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
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="h-8">
              Apply
            </Button>
          </div>
        </>
      </form>
    </Form>
  );
}
