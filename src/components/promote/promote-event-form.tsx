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
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { FileUpload, UploadedFile } from "../shared/upload-file-client-side";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { useRef, useState } from "react";
import { EventSearchBar } from "../shared/search-events-dropdown";
import { SearchTermEvent } from "@/lib/data/events-data";

const FormSchema = z.object({
  event_name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  showPromotionTo: z.array(z.enum(["fans", "genre-fans", "everyone"])).min(1, {
    message: "Please select at least one audience.",
  }),
  amount: z.coerce
    .number()
    .min(0.01, { message: "Amount must be greater than 0." }),
});

export function PromoteEventForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      event_name: "",
      amount: 0,
      showPromotionTo: [],
    },
  });

  const { setValue, clearErrors } = form;
  const eventIdRef = useRef<string | null | undefined>(null);

  const handleEventSelect = (event: SearchTermEvent) => {
    console.log("event: ", event);
    setValue("event_name", event.event_name);
    eventIdRef.current = event.id;
    clearErrors("event_name");
  };

  const searchInputProps = {
    inputPlaceholder: "Search for an event",
    clearInput: false,
  };

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {}

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Promotion</CardTitle>
        <CardDescription>
          Set up a promotion campaign for your event
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="event_name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <EventSearchBar
                      searchInputProps={searchInputProps}
                      onBandSelect={handleEventSelect}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Start date when the promotion is going to be shown
                      (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() ||
                            (!!form.getValues("startDate") &&
                              date < form.getValues("startDate")!)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      End date when the promotion is going to be removed
                      (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Show Promotion To */}
            <FormField
              control={form.control}
              name="showPromotionTo"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Show Promotion To
                    </FormLabel>
                  </div>
                  <div className="space-y-4">
                    {[
                      {
                        id: "fans" as const,
                        label: "Fans",
                        description: "People who have favorited your band",
                      },
                      {
                        id: "genre-fans" as const,
                        label: "Genre Fans",
                        description:
                          "People who have favorited the same genres",
                      },
                      {
                        id: "everyone" as const,
                        label: "Everyone",
                        description: "All users on the platform",
                      },
                    ].map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="showPromotionTo"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FileUpload onFileSelect={setUploadedFiles} maxFiles={2} />
            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Create Promotion
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
