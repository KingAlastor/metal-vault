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
import { EventFilters } from "@/components/events/event-types";
import { getEventsByFilters } from "@/lib/data/events-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession, useUpdateUser } from "@/lib/session/client-hooks";

const FormSchema = z.object({
  favorites_only: z.boolean().default(false).optional(),
  favorite_genres_only: z.boolean().default(false).optional(),
  country: z.boolean().default(false).optional(),
});

interface FiltersFormProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  filters: any;
  setFilters: Dispatch<SetStateAction<EventFilters>>;
}

export function EventsFiltersForm({
  setIsOpen,
  filters,
  setFilters,
}: FiltersFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      favorites_only: filters?.favorites_only || false,
      favorite_genres_only: filters?.favorite_genres_only || false,
      country: filters?.country || false,
    },
  });

  const { data: session } = useSession();

  const queryClient = useQueryClient();
  const updateUser = useUpdateUser();

  const mutation = useMutation({
    mutationFn: () => getEventsByFilters({ cursor: undefined, page_size: 10 }),
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["events-feed"] });
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const updateFilters = async () => {
      let filters: EventFilters = {
        favorites_only: data.favorites_only ?? false,
        favorite_genres_only: data.favorite_genres_only ?? false,
        country: data.country ?? false,
      };
      setIsOpen(false);
      setFilters(filters);
      await updateUser.mutateAsync({ events_settings: filters });
      mutation.mutate();
    };
    updateFilters();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {})}
        className="w-full space-y-6"
      >
        <>
          <div className="space-y-1 rounded-lg border p-2">
            {!session?.isLoggedIn && <p>Log in to use filters</p>}
            <FormField
              control={form.control}
              name="favorites_only"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel
                      className={`text-base ${
                        !session?.isLoggedIn ? "text-gray-400" : ""
                      }`}
                    >
                      Show events that include my favorite artists
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!session?.isLoggedIn}
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
                    <FormLabel
                      className={`text-base ${
                        !session?.isLoggedIn ? "text-gray-400" : ""
                      }`}
                    >
                      Show events that include my favorite genres
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!session?.isLoggedIn}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel
                      className={`text-base ${
                        !session?.isLoggedIn ? "text-gray-400" : ""
                      }`}
                    >
                      Show events happening in my country
                    </FormLabel>
                    <FormDescription >
                      Filter events based on country set up under your profile
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!session?.isLoggedIn}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                className="h-8"
                disabled={form.formState.isSubmitting || !session?.isLoggedIn}
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
