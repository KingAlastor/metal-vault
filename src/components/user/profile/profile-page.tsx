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
import { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { useEffect, useState } from "react";
import { updateProfile } from "@/lib/data/user/profile/profile-data-actions";
import UserNameField from "./form-username-input";
import { getGenres } from "@/lib/data/genres/genre-data-actions";
import { MultiSelectDropdown } from "@/components/shared/multiselect-dropdown";
import { useQuery } from "@tanstack/react-query";
import { CountrySelectDropdown } from "@/components/shared/select-country-dropdown";
import { DeleteUserDialog } from "./delete-user-dialog";

interface SettingsPageProps {
  user: User;
}

interface Country {
  name: {
    common: string;
  };
  cca2: string;
}

export const FormSchema = z.object({
  userName: z.string().trim().min(1, "Cannot be empty"),
  country: z.string(),
  genreTags: z.array(z.string()),
});

export default function ProfilePage({ user }: SettingsPageProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      userName: user.userName || user.name!,
      country: user.location || "",
      genreTags: Array.isArray(user.genreTags) ? user.genreTags : [],
    },
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const { data: session, update: updateSession } = useSession();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


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
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await updateProfile(data);
      toast({ description: "Profile updated." });
      // Currently not working
      await updateSession();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "An error occurred. Please try again.",
      });
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    signOut({ callbackUrl: "/" });
  };

  return (
    <FormProvider {...form}>
      <main>
        <section>
          <h1 className="text-3xl font-bold">Profile</h1>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-sm space-y-2.5"
          >
            <UserNameField />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Country</FormLabel>
                  <CountrySelectDropdown
                    control={form.control}
                    name="country"
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
          <div className="mt-8 pt-4 border-t">
            <h2 className="text-xl font-semibold text-destructive mb-2">Danger Zone</h2>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              type="button"
            >
              Delete Account
            </Button>
          </div>
        </section>
      </main>
      <DeleteUserDialog 
        open={isDeleteDialogOpen} 
        onClose={handleCloseDeleteDialog} 
      />
    </FormProvider>
  );
}
