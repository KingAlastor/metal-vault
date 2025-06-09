"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast, useToast } from "@/components/ui/use-toast";
import { createEmail } from "./create-email";
import { sendMail } from "@/lib/email/send-email";
import { useSession, useUpdateUser, useUser } from "@/lib/session/client-hooks";

export const EmailFormSchema = z.object({
  preferred_email: z.string(),
  email_frequency: z.string().default("W"),
  favorite_bands: z.boolean().default(false).optional(),
  favorite_genres: z.boolean().default(true).optional(),
});

export default function EmailUpdatesPage() {
  const { data: session } = useSession()
  const { data: user } = useUser(session?.userId);

  const filters = useMemo(() => {
    if (!user?.email_settings) {
      return {}; // Return an empty object if no settings
    }
    try {
      return JSON.parse(user.email_settings);
    } catch (error) {
      console.error("Failed to parse email_settings JSON:", error);
      return {}; // Return empty object or default on parsing error
    }
  }, [user?.email_settings]); // Dependency: recompute only if email_settings string changes

  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(
    // Initialize based on memoized filters
    !!filters.email_updates_enabled
  );

  // Update emailUpdatesEnabled if filters change (e.g., after initial data load)
  useEffect(() => {
    setEmailUpdatesEnabled(!!filters.email_updates_enabled);
  }, [filters.email_updates_enabled]);

  const updateUser = useUpdateUser();
  const { toast } = useToast(); 

  const toggleEmailUpdatesEnabled = useCallback(
    async (checked: boolean) => {
      const updatedFilters = {
        ...filters,
        email_updates_enabled: checked,
      };

      try {
        // Use the useUpdateUser hook to update the user
        await updateUser.mutateAsync({
          email_settings: JSON.stringify(updatedFilters),
        });
        setEmailUpdatesEnabled(checked);
        toast({ description: "Email updates setting updated." });
      } catch (error) {
        console.error("Failed to update email updates setting:", error);
        toast({ description: "Failed to update email updates setting.", variant: "destructive" });
      }
    },
    [filters, updateUser, toast]
  );

  const form = useForm<z.infer<typeof EmailFormSchema>>({
    resolver: zodResolver(EmailFormSchema),
    defaultValues: {
      preferred_email: filters?.preferred_email || user?.email!,
      favorite_bands: filters?.favorite_bands || false,
      email_frequency: filters?.email_frequency || "W",
      favorite_genres: filters?.favorite_genres || false,
    },
  });

  useEffect(() => {
    if (user) { // Ensure user data is available
      form.reset({
        preferred_email: filters?.preferred_email || user.email || "",
        favorite_bands: filters?.favorite_bands || false,
        email_frequency: filters?.email_frequency || "W",
        favorite_genres: filters?.favorite_genres || false,
      });
    }
  }, [user, filters, form.reset]);
  const sendTestEmail = useCallback(
    async (data: z.infer<typeof EmailFormSchema>) => {
      // Ensure all boolean fields are defined for EmailData type
      const emailData = {
        preferred_email: data.preferred_email,
        email_frequency: data.email_frequency,
        favorite_bands: data.favorite_bands ?? false,
        favorite_genres: data.favorite_genres ?? false,
      };
      const email = await createEmail(emailData);
      console.log("email: ", email);
      if (email) {
        await sendMail(
          data.preferred_email,
          "Newsletter",
          email.text,
          email.html
        );
      }
      console.log("Sending test email with data:", data);
      toast({ description: "Sending test email..." });
      try {
        // Replace this with your actual email sending function
        // await sendEmail(data);
        toast({ description: "Test email sent successfully!" });
      } catch (error) {
        console.error("Error sending test email:", error);
        toast({ description: "Failed to send test email." });
      }
    },
    []
  );

  const onSubmit = useCallback(
    async (data: z.infer<typeof EmailFormSchema>) => {
      const updatedFilters = {
        preferred_email: data.preferred_email,
        email_frequency: data.email_frequency,
        favorite_bands: data.favorite_bands ?? false,
        favorite_genres: data.favorite_genres ?? false,
        email_updates_enabled: emailUpdatesEnabled,
      };

      try {
        // Use the useUpdateUser hook to update the user
        await updateUser.mutateAsync({
          email_settings: JSON.stringify(updatedFilters),
        });
        toast({ description: "Email settings updated successfully." });
      } catch (error) {
        console.error("Failed to update email settings:", error);
        toast({ description: "Failed to update email settings.", variant: "destructive" });
      }
    },
    [emailUpdatesEnabled, updateUser]
  );

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
                  onCheckedChange={toggleEmailUpdatesEnabled}
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
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                onClick={form.handleSubmit(sendTestEmail)}
                disabled={form.formState.isSubmitting}
              >
                Send Email
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
