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
  updateProfileFilters,
} from "@/lib/data/user/emailUpdates/email-settings-data-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const FormSchema = z.object({
  preferred_email: z.string(),
  email_frequency: z.string().default("W"),
  favorite_bands: z.boolean().default(false).optional(),
  favorite_genres: z.boolean().default(true).optional(),
});

interface EmailUpdatesPageProps {
  user: User;
}

export default function EmailUpdatesPage({ user }: EmailUpdatesPageProps) {
  const [filters, setFilters] = useState<EmailSettings>();
  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      preferred_email: filters?.preferred_email || user.email!,
      favorite_bands: filters?.favorite_bands || false,
      email_frequency: filters?.email_frequency || "W",
      favorite_genres: filters?.favorite_genres || false,
    },
  });

  useEffect(() => {
    const fetchUserFilters = async () => {
      if (user?.id) {
        let userFilters = await getUserEmailSettings(user.id!);
        setFilters(userFilters);
        if (userFilters) {
          setEmailUpdatesEnabled(true);
          form.reset({
            preferred_email: userFilters.preferred_email || user.email!,
            favorite_bands: userFilters.favorite_bands || false,
            email_frequency: userFilters.email_frequency || "W",
            favorite_genres: userFilters.favorite_genres || false,
          });
        }
      }
    };
    fetchUserFilters();
  }, [user.id, user.email, form]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const updateFilters = async () => {
      let filters: EmailSettings = {
        preferred_email: data.preferred_email,
        email_frequency: data.email_frequency,
        favorite_bands: data.favorite_bands ?? false,
        favorite_genres: data.favorite_genres ?? false,
      };
      setFilters(filters);
      updateProfileFilters(data);
    };
    updateFilters();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div className="text-sm font-normal sm:text-base sm:font-medium">
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Turn on email updates
                </FormLabel>
                <FormDescription className="hidden sm:block text-sm text-gray-500">
                  Receive a recurring email of released albums and events
                </FormDescription>
              </div>
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
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="W" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Weekly (Every Saturday)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="M" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Monthly (1st of every month)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="favorite_bands"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Bands i follow
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
                          My favorite genres
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
