"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, CheckIcon, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { updateProfile } from "@/lib/data/user/profile/profile-data-actions";
import UserNameField from "./form-username-input";
import { Genre, getGenres } from "@/lib/data/genres/genre-data-actions";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
  const [genres, setGenres] = useState<Genre[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<Set<string>>(
    new Set(user.genreTags)
  );
  const { data: session, update: updateSession } = useSession();

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

  useEffect(() => {
    const fetchGenres = async () => {
      const genres = await getGenres();
      setGenres(genres);
    };
    fetchGenres();
  }, []);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      data.genreTags = Array.from(selectedValues);
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
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? countries.find(
                                (country) => country.name.common === field.value
                              )?.name.common
                            : "Select location"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {countries.map((country) => (
                              <CommandItem
                                value={country.name.common}
                                key={country.cca2}
                                onSelect={() => {
                                  form.setValue("country", country.name.common);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    country.name.common === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {country.name.common}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                  <FormDescription>
                    Add your favorite genres
                  </FormDescription>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" size="sm" className="h-8">
                          Genres
                          {selectedValues?.size > 0 && (
                            <>
                              <Separator
                                orientation="vertical"
                                className="mx-2 h-4"
                              />
                              <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal lg:hidden"
                              >
                                {selectedValues.size}
                              </Badge>
                              <div className="hidden space-x-1 lg:flex">
                                {selectedValues.size > 2 ? (
                                  <Badge
                                    variant="secondary"
                                    className="rounded-sm px-1 font-normal"
                                  >
                                    {selectedValues.size} selected
                                  </Badge>
                                ) : (
                                  genres
                                    .filter((genre: Genre) =>
                                      selectedValues.has(genre.genres)
                                    )
                                    .map((genre: Genre) => (
                                      <Badge
                                        variant="secondary"
                                        key={genre.genres}
                                        className="rounded-sm px-1 font-normal"
                                      >
                                        {genre.genres}
                                      </Badge>
                                    ))
                                )}
                              </div>
                            </>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search genre..." />
                        <CommandList>
                          <CommandEmpty>Genre not found.</CommandEmpty>
                          <CommandGroup>
                            {genres.map((genre) => {
                              const isSelected = selectedValues.has(
                                genre.genres
                              );
                              return (
                                <CommandItem
                                  key={genre.genres}
                                  onSelect={() => {
                                    const newSelectedValues = new Set(
                                      selectedValues
                                    );
                                    if (isSelected) {
                                      newSelectedValues.delete(genre.genres);
                                    } else {
                                      newSelectedValues.add(genre.genres);
                                    }
                                    setSelectedValues(newSelectedValues);
                                  }}
                                >
                                  <div
                                    className={cn(
                                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible"
                                    )}
                                  >
                                    <CheckIcon className={cn("h-4 w-4")} />
                                  </div>
                                  <span>{genre.genres}</span>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                        {selectedValues.size > 0 && (
                          <>
                            <CommandSeparator />
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => setSelectedValues(new Set())}
                                className="justify-center text-center"
                              >
                                Clear filters
                              </CommandItem>
                            </CommandGroup>
                          </>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save</Button>
          </form>
        </section>
      </main>
    </FormProvider>
  );
}
