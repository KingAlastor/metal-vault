"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ReportSchema } from "./post-form-schemas";
import { ReportFormInput, ReportPostFormProps } from "./post-form-types";
import { savePostReport } from "@/lib/data/posts/posts-data-actions";

export function ReportPostForm({ setIsOpen, postId }: ReportPostFormProps) {
  const [submissionState, setSubmissionState] = useState<{ message?: string }>(
    {}
  );

  const form = useForm<ReportFormInput>({
    resolver: zodResolver(ReportSchema),
    defaultValues: {
      field: undefined,
      value: "",
      comment: "",
    },
  });

  async function onSubmit(data: ReportFormInput) {
    setSubmissionState({ message: "Submitting..." });
    const formData = {
      ...data,
      postId,
    }
    await savePostReport(formData);
    setIsOpen(false);
    setSubmissionState({ message: "Report submitted successfully!" });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="field"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>What needs to be corrected?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {[
                    "Incorrect band name",
                    "Incorrect genres",
                    "Issues with user comment",
                    "Incorrect link",
                  ].map((option) => (
                    <FormItem
                      className="flex items-center space-x-3 space-y-0"
                      key={option}
                    >
                      <FormControl>
                        <RadioGroupItem value={option} />
                      </FormControl>
                      <FormLabel className="font-normal">{option}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correct value (optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
        {submissionState.message && (
          <p className="mt-4 text-green-500">{submissionState.message}</p>
        )}
      </form>
    </Form>
  );
}
