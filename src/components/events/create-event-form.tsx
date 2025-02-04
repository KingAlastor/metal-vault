"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { BandSearchBar } from "@/components/shared/search-bands-dropdown";
import { Band } from "@/lib/data/bands/search-bands-data-actions";
import { MultiSelectDropdown } from "@/components/shared/multiselect-dropdown";
import { getGenres } from "@/lib/data/genres/genre-data-actions";
import { useQuery } from "@tanstack/react-query";
import { useSubmitEventMutation } from "./hooks/use-submit-event-mutation";
import {
  AddEventProps,
  CreateEventFormProps,
  EventCountry,
} from "./event-types";
import { CountrySelectDropdown } from "../shared/select-country-dropdown";
import { DateRangePicker } from "../shared/date-range-picker";
import { DateRange } from "react-day-picker";
import { BandList } from "./band-list";

const initialFormState = {
  eventName: "",
  country: "",
  city: "",
  bands: [] as string[],
  genreTags: [] as string[],
  fromDate: "",
  toDate: "",
  imageUrl: "",
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
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  imageUrl: z.string(),
  website: z.string(),
});

export function CreateEventForm({ setOpen, event }: CreateEventFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: event
      ? {
          eventName: event.eventName,
          country: event.country,
          city: event.city,
          bands: event.bands,
          genreTags: event.genreTags,
          dateRange:
            event?.fromDate && event?.toDate
              ? { from: new Date(event.fromDate), to: new Date(event.toDate) }
              : { from: new Date(), to: new Date() },
          imageUrl: event.imageUrl ?? "",
          website: event.website ?? "",
        }
      : initialFormState,
  });

  const { reset, setValue, control, handleSubmit } = form;

  const mutation = useSubmitEventMutation();

  const [countries, setCountries] = useState<EventCountry[]>([]);
  const [bandsIds, setBandIds] = useState<string[]>(event?.bandIds ?? []);
  const [bands, setBands] = useState<string[]>(event?.bands ?? []);

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
    console.log("Form validation passed, raw data:", data);
    try {
      const formData: AddEventProps = {
        ...data,
        id: event?.id ?? "",
        bands: bands,
        bandIds: bandsIds,
      };
      console.log("form data: ", formData);
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
    setBandIds((prevBands) => [...prevBands, band.bandId]);
    setBands((prevBands) =>
      [
        ...prevBands,
        JSON.stringify({
          id: band.bandId,
          namePretty: band.namePretty,
          genreTags: band.genreTags,
          country: band.country,
        }),
      ].sort((a, b) => a.localeCompare(b))
    );
    setValue(
      "genreTags",
      Array.from(new Set([...form.getValues("genreTags"), ...band.genreTags]))
    );
  };

  const handleBandRemove = (bandToRemove: string) => {
    setBands((prevBands) => prevBands.filter((band) => band !== bandToRemove));
    const bandData = JSON.parse(bandToRemove);
    setBandIds((prevBandIds) =>
      prevBandIds.filter((id) => id !== bandData.bandId)
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("Form validation failed:", errors);
          console.log("Current form values:", form.getValues());
        })}
        className="w-full space-y-6"
      >
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
        <div className="flex space-x-4 w-full">
          <FormField
            control={control}
            name="country"
            render={({ field }) => (
              <FormItem className="w-1/2">
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
            name="city"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormControl>
                  <Input placeholder="City..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
        {bands.length > 0 && (
          <BandList bands={bands} onRemove={handleBandRemove} />
        )}
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
        <div className="flex space-x-4 w-full">
          <FormField
            control={control}
            name="dateRange"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <DateRangePicker
                  date={field.value}
                  onDateChange={(newDate) => field.onChange(newDate)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Poster/image URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Website URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Save Event</Button>
        </div>
      </form>
    </Form>
  );
}
