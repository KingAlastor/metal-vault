"use client";

import { UploadedFiles, uploadFiles } from "../shared/upload-file-server-side";
import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, CheckCircle } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload, UploadedFile } from "../shared/upload-file-client-side";
import { BandSearchBar } from "../shared/search-bands-dropdown";
import { SearchTermBand } from "@/lib/data/bands-data";
import {
  addPromotion,
  checkIfActivePromotionExists,
  PromotionFormData,
} from "@/lib/data/promotions-data";
import { useToast } from "../ui/use-toast";

// Define the form schema
const promotionFormSchema = z.object({
  band_name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  showPromotionTo: z.array(z.enum(["fans", "genre-fans", "everyone"])).min(1, {
    message: "Please select at least one audience.",
  }),
  /*   amount: z.coerce
    .number()
    .min(0.01, { message: "Amount must be greater than 0." }), */
});

type PromotionFormValues = z.infer<typeof promotionFormSchema>;

export default function PromoteBandForm() {
  /*   const [totalCost, setTotalCost] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false); */
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      band_name: "",
      /* amount: 0, */
      showPromotionTo: [],
    },
  });

  const { control, setValue, clearErrors, watch, setError } = form;

  const watchedBand = watch("band_name");
  const lastCheckedBandIdRef = useRef<string | null>(null);
  const bandIdRef = useRef<string | null | undefined>(null);

  useEffect(() => {
    // Handles async form validation
    const checkPromotionExists = async () => {
      if (
        bandIdRef.current &&
        watchedBand &&
        bandIdRef.current !== lastCheckedBandIdRef.current
      ) {
        lastCheckedBandIdRef.current = bandIdRef.current;
        try {
          const exists = await checkIfActivePromotionExists(
            bandIdRef.current,
            "band"
          );

          if (exists) {
            setError("band_name", {
              type: "manual",
              message:
                "This band already has active promotion. Please wait or select a different band.",
            });
          } else {
            clearErrors("band_name");
          }
        } catch (error) {
          console.error("Error checking if post exists:", error);
        }
      }
    };

    checkPromotionExists();
  }, [watchedBand, setError, clearErrors]);

  const showPromotionTo = form.watch("showPromotionTo");
  // const amount = form.watch("amount");
  const searchInputProps = {
    inputPlaceholder: "Search for a band",
    clearInput: false,
  };

  const handleBandSelect = (band: SearchTermBand) => {
    setValue("band_name", band.namePretty);
    bandIdRef.current = band.bandId;
    clearErrors("band_name");
  };

  // Dummy function commented out for the time being
  /*   const calculateCost = async (
    targets: string[],
    baseAmount: number
  ): Promise<number> => {
    setIsCalculating(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Dummy cost multipliers based on target audience
    const multipliers = {
      fans: 1.5,
      "genre-fans": 0.75,
      everyone: 0.25,
    };

    // Calculate total multiplier (sum of all selected targets)
    const totalMultiplier = targets.reduce((sum, target) => {
      return sum + (multipliers[target as keyof typeof multipliers] || 0);
    }, 0);

    const calculatedCost = baseAmount * totalMultiplier;

    setIsCalculating(false);
    return calculatedCost;
  }; */

  /*   useEffect(() => {
    if (showPromotionTo && showPromotionTo.length > 0 && amount > 0) {
       calculateCost(showPromotionTo, amount).then(setTotalCost);
    } else {
      setTotalCost(0);
    }
  }, [showPromotionTo, amount]); */

  const { toast } = useToast();

  async function onSubmit(data: PromotionFormValues) {
    try {
      const formData = new FormData();

      if (uploadedFiles.length > 0) {
        console.log("uploaded files: ", uploadedFiles);
        const validatedPromotionImages = validatePromotionImages(uploadedFiles);
        if (validatedPromotionImages.length > 0) {
          validatedPromotionImages.forEach((file) =>
            formData.append("file", file.file)
          );
        }
        const uploadResult = await uploadFiles(formData, "promotion");
        console.log("upload result: ", uploadResult);
        if (!uploadResult.success) {
          const firstError = uploadResult.results.find(
            (result) => result.error
          )?.error;
          toast({
            title: "Error",
            description: firstError ?? "Failed to upload files",
            variant: "destructive",
          });
        } else {
          const promotionFormData: PromotionFormData = {
            ad_target_id: bandIdRef.current!,
            ad_target_type: "band",
            start_date: data.startDate?.toISOString(),
            end_date: data.endDate?.toISOString(),
            filename_desktop: getFilenameByImageType(
              "desktop",
              validatedPromotionImages,
              uploadResult
            ),
            filename_mobile: getFilenameByImageType(
              "mobile",
              validatedPromotionImages,
              uploadResult
            ),
            ad_content: { showPromotionTo },
          };
          try {
            await addPromotion(promotionFormData);
            form.reset();
          } catch (error) {
            toast({
              title: "Error",
              description: `Failed to add promotion: ${error}`,
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error submitting promotion:", error);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Promotion</CardTitle>
        <CardDescription>
          Set up a promotion campaign for your band or event
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dynamic Name Field */}
            <FormField
              control={form.control}
              name="band_name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <BandSearchBar
                      searchInputProps={searchInputProps}
                      onBandSelect={handleBandSelect}
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

            {/*             <FormField
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

            
            {showPromotionTo && showPromotionTo.length > 0 && amount > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Total Cost</p>
                    <p className="text-sm text-muted-foreground">
                      Targeting:{" "}
                      {showPromotionTo
                        .map((target) => {
                          switch (target) {
                            case "fans":
                              return "Fans";
                            case "genre-fans":
                              return "Genre Fans";
                            case "everyone":
                              return "Everyone";
                            default:
                              return target;
                          }
                        })
                        .join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    {isCalculating ? (
                      <p className="text-lg font-bold">Calculating...</p>
                    ) : (
                      <p className="text-lg font-bold">
                        ${totalCost.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )} */}

            <FileUpload onFileSelect={setUploadedFiles} maxFiles={2} />
            {uploadedFiles.length > 0 && (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {`${uploadedFiles.length} file${
                  uploadedFiles.length > 1 ? "s" : ""
                } selected`}
              </div>
            )}
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

const validatePromotionImages = (uploadedFiles: UploadedFile[]) => {
  return uploadedFiles.filter((file) => {
    const imageType = getImageTypeByDimensions(file.dimensions?.height);
    if (imageType && imageType !== "other") {
      return file;
    }
  });
};

const getImageTypeByDimensions = (height: number | undefined) => {
  if (height) {
    return height >= 300 && height <= 350
      ? "desktop"
      : height < 100
      ? "mobile"
      : "other";
  } else {
    return null;
  }
};

const getFilenameByImageType = (
  type: string,
  validatedPromotionImages: UploadedFile[],
  uploadResult: UploadedFiles
) => {
  for (const [index, file] of validatedPromotionImages.entries()) {
    if (getImageTypeByDimensions(file.dimensions?.height) === type) {
      return uploadResult.results[index]?.filename ?? null;
    }
  }
  return null;
};
