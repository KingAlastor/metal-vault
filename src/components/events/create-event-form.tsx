"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usePathname } from "next/navigation";

import { BandSearchBar } from "@/components/shared/search-bands-dropdown";
import { Band } from "@/lib/data/bands/search-bands-data-actions";
import { MultiSelectDropdown } from "@/components/shared/multiselect-dropdown";
import { getGenres } from "@/lib/data/genres/genre-data-actions";
import { useQuery } from "@tanstack/react-query";
import { useSubmitEventMutation } from "./hooks/use-submit-event-mutation";
import { AddEventProps, CreateEventFormProps, Event, EventCountry } from "./event-types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CountrySelectDropdown } from "../shared/select-country-dropdown";

const initialFormState = {
  eventName: "",
  country: "",
  city: "",
  bands: [] as string[],
  genreTags: [] as string[],
  fromDate: "",
  toDate: "",
  website: "",
};

const FormSchema = z.object({
  eventName: z.string(),
  country: z.string(),
  city: z.string(),
  bands: z.array(z.string(), {
    message: "Please enter a band name",
  }),
  genreTags: z.array(z.string(), {
    message: "Please select at least one genre",
  }),
  fromDate: z.string(),
  toDate: z.string(),
  website: z.string(),
});

export function CreateEventForm({ setOpen }: CreateEventFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialFormState,
  });

  const { reset, setValue, control, handleSubmit } = form;

  const mutation = useSubmitEventMutation();

  const [countries, setCountries] = useState<EventCountry[]>([]);
  const [CountryOpen, setCountOpen] = useState(false);
  const [bands, setBands] = useState<string[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      const response = await fetch("https://restcountries.com/v3.1/all");
      const data = await response.json();
      data
        .sort((a: EventCountry, b: EventCountry) =>
          a.name.common.localeCompare(b.name.common)
        )
        .map((country: EventCountry) => ({
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
      const formData: AddEventProps = {
        ...data,
        fromDate: new Date(data.fromDate),
        toDate: new Date(data.toDate),
        bandIds: bands,
      };
      mutation.mutate(formData, {
        onSuccess: () => {
          reset(initialFormState);
          setOpen(false);
        },
      });
    } catch (error) {
      console.error("Error adding post:", error);
    }
  }

  const searchInputProps = {
    inputPlaceholder: "Enter band name",
    clearInput: true,
  };

  const handleBandSelect = (band: Band) => {
    setBands((prevBands) => [...prevBands, band.bandId]);
    setValue("genreTags", band.genreTags);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={control}
          name="eventName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Event name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormControl>
              <CountrySelectDropdown
                  control={form.control}
                  name="country"
                  countries={countries}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="bands"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <BandSearchBar
                  searchInputProps={searchInputProps}
                  onBandSelect={handleBandSelect}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="genreTags"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormControl>
                <MultiSelectDropdown
                  options={genres || []}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                    setValue("genreTags", newValue);
                  }}
                  value={field.value}
                  triggerText="Select genres"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-4">
          <FormField
            control={control}
            name="fromDate"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="From date..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="toDate"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="To date..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Website..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Create Post</Button>
        </div>
      </form>
    </Form>
  );
}
