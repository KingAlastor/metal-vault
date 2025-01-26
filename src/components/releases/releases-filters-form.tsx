"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import {
  ReleasesFilters,
  updateProfileFilters,
} from "../../lib/data/releases/releases-filters-data-actions";
import { Genre, getGenres } from "@/lib/data/genres/genre-data-actions";
import { Check, CheckIcon, ChevronsUpDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const FormSchema = z.object({
  favorite_bands: z.boolean().default(false).optional(),
  favorite_genres: z.boolean().default(false).optional(),
  genreTags: z.array(z.string()),
});

interface FiltersFormProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  filters: any;
  setFilters: Dispatch<SetStateAction<ReleasesFilters>>;
}

export function ReleasesFiltersForm({
  setIsOpen,
  filters,
  setFilters,
}: FiltersFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      favorite_bands: filters?.favorite_bands || false,
      favorite_genres: filters?.favorite_genres || false,
      genreTags: Array.isArray(filters.genreTags) ? filters.genreTags : [],
    },
  });

  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedValues, setSelectedValues] = useState<Set<string>>(
    new Set(filters.genreTags)
  );

  useEffect(() => {
    const fetchGenres = async () => {
      const genres = await getGenres();
      setGenres(genres);
    };
    fetchGenres();
  }, []);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const updateFilters = async () => {
      let filters: ReleasesFilters = {
        favorite_bands: data.favorite_bands ?? false,
        favorite_genres: data.favorite_genres ?? false,
        genreTags: Array.from(selectedValues),
      };
      setFilters(filters);
      setIsOpen(false);
      updateProfileFilters(filters);
    };
    updateFilters();
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
        <div>
          <div className="space-y-4 rounded-lg border p-4">
            <FormField
              control={form.control}
              name="favorite_bands"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Show my favorite artists
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
                      Use my favorite genres
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
              name="genreTags"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Genres</FormLabel>
                  <FormDescription>Add additional genres</FormDescription>
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
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
