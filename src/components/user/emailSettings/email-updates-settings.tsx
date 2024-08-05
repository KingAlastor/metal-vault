"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User } from "next-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { EmailSettings, getUserEmailSettings } from "@/lib/data/user/emailUpdates/email-settings-data-actions";

const FormSchema = z.object({
    preferred_email: z.string(),
    email_frequency: z.string().default('W'),
    favorites: z.boolean().default(false).optional(),
    genres: z.array().default().optional(),
    follower_count: z.number().default(1).optional(),
    events: z.boolean().default(false).optional(),
    events_loc: z.string().optional(),
});

interface EmailUpdatesPageProps {
  user: User;
}

export default function EmailUpdatesPage({ user }: EmailUpdatesPageProps) {
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchUserFilters = async () => {
      if (user?.id) {
        let userFilters = await getUserEmailSettings(user.id!);
        setFilters(userFilters);
      }
      fetchUserFilters();
    };
  }, []);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const updateFilters = async () => {
      let filters: EmailSettings = {
        favorites_only: data.favorites_only ?? false,
        favorite_genres_only: data.favorite_genres_only ?? false,
      };
      setFilters(filters);
      setIsOpen(false);
      updateProfileFilters(data);
    };
    updateFilters();
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      favorites_only: filters?.favorites_only || false,
      favorite_genres_only: filters?.favorite_genres_only || false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div>
          <div className="space-y-4 rounded-lg border p-4">
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
            <div className="flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
