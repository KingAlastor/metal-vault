"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User } from "next-auth";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  EmailSettings,
  getUserEmailSettings,
} from "@/lib/data/user/emailUpdates/email-settings-data-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const FormSchema = z.object({
  preferred_email: z.string(),
  email_frequency: z.string().default("W"),
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
  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(false);

  useEffect(() => {
    const fetchUserFilters = async () => {
      if (user?.id) {
        let userFilters = await getUserEmailSettings(user.id!);
        setFilters(userFilters);
      }
      fetchUserFilters();
    };
  }, [user.id]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const updateFilters = async () => {
      let filters: EmailSettings = {
        favorites_only: data.favorites_only ?? false,
        favorite_genres_only: data.favorite_genres_only ?? false,
      };
      setFilters(filters);
      updateProfileFilters(data);
    };
    updateFilters();
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      preferred_email: filters?.preferred_email || "", // Add default value for preferred_email
      favorites_only: filters?.favorites_only || false,
      favorite_genres_only: filters?.favorite_genres_only || false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div className="text-sm font-normal sm:text-base sm:font-medium">
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex flex-row items-center justify-between">
              <FormLabel className="text-base">Turn on email updates</FormLabel>
              <FormControl>
                <Switch
                  checked={emailUpdatesEnabled}
                  onCheckedChange={setEmailUpdatesEnabled}
                />
              </FormControl>
            </div>
            {emailUpdatesEnabled && (
              <>
                <FormField
                  control={form.control}
                  name="preferred_email"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Preferred Email
                        </FormLabel>
                        <FormDescription className="hidden sm:block text-sm text-gray-500">
                          Email address for receving updates
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your preferred email"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          className="w-32 sm:w-48 md:w-64"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email_frequency"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Email Frequency
                        </FormLabel>
                        <FormDescription className="hidden sm:block text-sm text-gray-500">
                          Choose how often you want to receive emails
                        </FormDescription>
                      </div>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="W" id="weekly" />
                            <Label htmlFor="weekly">Weekly</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="M" id="monthly" />
                            <Label htmlFor="monthly">Monthly</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
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
              </>
            )}
            <div className="flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
