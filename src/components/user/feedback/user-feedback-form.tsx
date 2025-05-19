"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { postUserFeedback } from "@/lib/data/user-feedback-data"

const formSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Title must be at least 2 characters.",
    })
    .max(100, {
      message: "Title must not exceed 100 characters.",
    }),
  comment: z
    .string()
    .min(10, {
      message: "Comment must be at least 10 characters.",
    })
    .max(500, {
      message: "Comment must not exceed 500 characters.",
    }),
})

export function UserFeedbackForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      comment: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await postUserFeedback(data);
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback!",
    })

    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter feedback title" {...field} />
              </FormControl>
              <FormDescription>Provide a brief title for your feedback.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter your feedback here" className="resize-none" {...field} />
              </FormControl>
              <FormDescription>Please provide your detailed feedback or comments.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit Feedback</Button>
      </form>
    </Form>
  )
}

