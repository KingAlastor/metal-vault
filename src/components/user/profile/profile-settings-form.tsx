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
import { authClient, useSession } from "@/lib/auth/auth-client";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { updateUserData } from "@/lib/data/user/profile/profile-data-actions";
import UserNameField from "./form-username-input";
import { getGenres } from "@/lib/data/genres/genre-data-actions";
import { MultiSelectDropdown } from "@/components/shared/multiselect-dropdown";
import { useQuery } from "@tanstack/react-query";
import { CountrySelectDropdown } from "@/components/shared/select-country-dropdown";

interface Country {
  name: {
    common: string;
  };
  cca2: string;
}

export const FormSchema = z.object({
  userName: z.string().trim().min(1, "Cannot be empty"),
  location: z.string().optional(),
  genreTags: z.array(z.string()).optional(),
});

export default function ProfileSettingsForm() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = session?.user;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      userName: user?.userName || user?.name!,
      location: user?.location || "",
      genreTags: Array.isArray(user?.genreTags) ? user.genreTags : [],
    },
  });

  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      const response = await fetch("https://restcountries.com/v3.1/all");
      const data = await response.json();
      data
        .sort((a: Country, b: Country) =>
          a.name.common.localeCompare(b.name.common)
        )
        .map((country: Country) => ({
          name: country.name.common,
          code: country.cca2,
        }));
      setCountries(data);
    };

    fetchCountries();
  }, []);

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
      await authClient.updateUser({
        userName: data.userName,
        location: data.location,
        genreTags: data.genreTags
      });
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
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Form validation failed:", errors);
          console.log("Current form values:", form.getValues());
        })}
        className="max-w-sm space-y-2.5"
      >
        <UserNameField />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Country</FormLabel>
              <CountrySelectDropdown
                control={form.control}
                name="location"
                countries={countries}
              />
              <FormDescription>
                Country is used to receive relevant events and band updates
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="genreTags"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Genres</FormLabel>
              <FormDescription>Add your favorite genres</FormDescription>
              <MultiSelectDropdown
                options={genres || []}
                onChange={field.onChange}
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
