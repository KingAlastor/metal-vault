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
import { MultiSelectDropdown } from "@/components/shared/multiselect-dropdown";
import { useQuery } from "@tanstack/react-query";
import { useSubmitEventMutation } from "./hooks/use-submit-event-mutation";
import {
  AddEventProps,
  CreateEventFormProps,
  EventCountry,
} from "./event-types";
import { CountrySelectDropdown } from "../shared/select-country-dropdown";
import { DateRangePicker } from "../shared/date-range-picker";
import { BandList } from "./band-list";
import { getGenres } from "@/lib/data/genres-data";
import { SearchTermBand } from "@/lib/data/bands-data";
import { FileUpload } from "../promote/file-upload";
import { uploadEventImage } from "../promote/upload-file";

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

  const [bandsIds, setBandIds] = useState<string[]>(event?.bandIds ?? []);
  const [bands, setBands] = useState<string[]>(event?.bands ?? []);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
    console.log("Form validation passed, raw data:", data);
    try {
      let imageUrl = data.imageUrl; // Default to existing imageUrl

      // Handle file upload if a file was selected
      if (uploadedFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", uploadedFile);

        const uploadResult = await uploadEventImage(fileFormData);
        if (uploadResult.success && uploadResult.filename) {
          imageUrl = uploadResult.filename; // Store just the filename in database
          console.log("File uploaded successfully:", uploadResult.url);
        } else {
          console.error("File upload failed:", uploadResult.error);
          // You might want to show an error message to the user here
          return;
        }
      }

      const formData: AddEventProps = {
        ...data,
        id: event?.id ?? "",
        bands: bands,
        bandIds: bandsIds,
        imageUrl: imageUrl, // Use uploaded filename or existing imageUrl
      };
      console.log("form data: ", formData);
      mutation.mutate(formData, {
        onSuccess: () => {
          reset(initialFormState);
          setUploadedFile(null); // Clear uploaded file
          setOpen(false);
        },
      });
    } catch (error) {
      console.error("Error adding event:", error);
    }
  }

  const searchInputProps = {
    inputPlaceholder: "Enter band name",
    clearInput: true,
  };

  const handleBandSelect = (band: SearchTermBand) => {
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
        {/* Event Poster Upload */}
        <div className="space-y-2">
          <FormLabel>Event Poster</FormLabel>
          <FileUpload onFileSelect={setUploadedFile} />
          {uploadedFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {uploadedFile.name}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save Event</Button>
        </div>
      </form>
    </Form>
  );
}
