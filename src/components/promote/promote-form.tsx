"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { FileUpload } from "./file-upload"
import { uploadPromotionFile } from "./upload-file"

// Define the form schema
const promotionFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  showPromotionTo: z.array(z.enum(["fans", "genre-fans", "everyone"])).min(1, {
    message: "Please select at least one audience.",
  }),
  amount: z.coerce.number().min(0.01, { message: "Amount must be greater than 0." }),
})

type PromotionFormValues = z.infer<typeof promotionFormSchema>

export default function ToggleForm() {
  const [formType, setFormType] = useState<"bands" | "events">("bands")
  const [totalCost, setTotalCost] = useState<number>(0)
  const [isCalculating, setIsCalculating] = useState(false)

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      showPromotionTo: [],
    },
  })

  // Watch the showPromotionTo field to trigger cost calculation
  const showPromotionTo = form.watch("showPromotionTo")
  const amount = form.watch("amount")

  // Dummy function to calculate cost based on promotion targets
  const calculateCost = async (targets: string[], baseAmount: number): Promise<number> => {
    setIsCalculating(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Dummy cost multipliers based on target audience
    const multipliers = {
      fans: 1.0, // Base rate for existing fans
      "genre-fans": 1.5, // 50% more for genre fans
      everyone: 2.0, // Double for everyone
    }

    // Calculate total multiplier (sum of all selected targets)
    const totalMultiplier = targets.reduce((sum, target) => {
      return sum + (multipliers[target as keyof typeof multipliers] || 0)
    }, 0)

    const calculatedCost = baseAmount * totalMultiplier

    setIsCalculating(false)
    return calculatedCost
  }

  // Effect to recalculate cost when target audience or amount changes
  useEffect(() => {
    if (showPromotionTo && showPromotionTo.length > 0 && amount > 0) {
      calculateCost(showPromotionTo, amount).then(setTotalCost)
    } else {
      setTotalCost(0)
    }
  }, [showPromotionTo, amount])

  async function onSubmit(data: PromotionFormValues) {
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("amount", data.amount.toString())
      formData.append("showPromotionTo", JSON.stringify(data.showPromotionTo))
      formData.append("type", formType)
      formData.append("totalCost", totalCost.toString())
      
      if (data.startDate) {
        formData.append("startDate", data.startDate.toISOString())
      }
      if (data.endDate) {
        formData.append("endDate", data.endDate.toISOString())
      }
      
      const result = await uploadPromotionFile(formData)
      if (result.success) {
        form.reset()
        // You might want to show a success message or redirect here
      } else {
        // Handle error case
        console.error("Upload failed:", result.error)
      }
    } catch (error) {
      console.error("Error submitting promotion:", error)
    }
  }

  const getTargetDescription = (target: string) => {
    switch (target) {
      case "fans":
        return "People who have favorited your band"
      case "genre-fans":
        return "People who have favorited the same genres"
      case "everyone":
        return "All users on the platform"
      default:
        return ""
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Promotion</CardTitle>
        <CardDescription>Set up a promotion campaign for your band or event</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Toggle between Bands and Events */}
            <div className="space-y-3">
              <FormLabel className="text-base font-medium">Promotion Type</FormLabel>
              <RadioGroup
                value={formType}
                onValueChange={(value) => setFormType(value as "bands" | "events")}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bands" id="bands" />
                  <FormLabel htmlFor="bands">Band</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="events" id="events" />
                  <FormLabel htmlFor="events">Event</FormLabel>
                </div>
              </RadioGroup>
            </div>

            {/* Dynamic Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{formType === "bands" ? "Band Name" : "Event Name"}</FormLabel>
                  <FormControl>
                    <Input placeholder={formType === "bands" ? "Enter band name" : "Enter event name"} {...field} />
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
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                    <FormDescription>Start date when the promotion is going to be shown (optional)</FormDescription>
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
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                            date < new Date() || (!!form.getValues("startDate") && date < form.getValues("startDate")!)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>End date when the promotion is going to be removed (optional)</FormDescription>
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
                    <FormLabel className="text-base">Show Promotion To</FormLabel>
                  </div>
                  <div className="space-y-4">
                    {[
                      { id: "fans" as const, label: "Fans", description: "People who have favorited your band" },
                      {
                        id: "genre-fans" as const,
                        label: "Genre Fans",
                        description: "People who have favorited the same genres",
                      },
                      { id: "everyone" as const, label: "Everyone", description: "All users on the platform" },
                    ].map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="showPromotionTo"
                        render={({ field }) => {
                          return (
                            <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item.id])
                                      : field.onChange(field.value?.filter((value) => value !== item.id))
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                            </FormItem>
                          )
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
                    <Input type="number" step="0.01" min="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Cost Display */}
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
                              return "Fans"
                            case "genre-fans":
                              return "Genre Fans"
                            case "everyone":
                              return "Everyone"
                            default:
                              return target
                          }
                        })
                        .join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    {isCalculating ? (
                      <p className="text-lg font-bold">Calculating...</p>
                    ) : (
                      <p className="text-lg font-bold">${totalCost.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <FileUpload />
            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Create Promotion
              </Button>
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Clear Form
              </Button>
            </div>
          </form>
        </Form>

      </CardContent>
    </Card>
  )
}
