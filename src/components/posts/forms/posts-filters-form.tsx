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
import { useSession, useUser } from "@/lib/session/client-hooks";
import { updateUserData } from "@/lib/data/profile-data";
import { getFullUserData } from "@/lib/data/user-data";

const FormSchema = z.object({
  favorites_only: z.boolean().default(false).optional(),
  favorite_genres_only: z.boolean().default(false).optional(),
});

interface FiltersFormProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export function PostsFiltersForm({ setIsOpen }: FiltersFormProps) {
  const { data: session } = useSession();
  const fullUser = useUser(session?.userId || "");
  const filters = JSON.parse(fullUser.data?.posts_settings || "{}");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      favorites_only: filters?.favorites_only || false,
      favorite_genres_only: filters?.favorite_genres_only || false,
    },
  });

  const queryClient = useQueryClient();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    let filters: PostsDataFilters = {
      favorites_only: data.favorites_only ?? false,
      favorite_genres_only: data.favorite_genres_only ?? false,
    };
    setIsOpen(false);
    await updateUserData({
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
                    <FormLabel className="text-base s-font">
                      <p className="m-font">Only show my favorite artists</p>
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
                    <FormLabel className="text-base s-font">
                      <p className="m-font">Only show my favorite genres</p>
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
