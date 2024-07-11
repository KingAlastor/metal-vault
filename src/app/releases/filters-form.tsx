"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { BandAlbum } from "./releases-table-columns";
import { getReleasesByFilters, getUserReleaseFilters, ReleasesFilters, updateProfileFilters } from "./filters-data-actions";
import { User } from "next-auth";

const FormSchema = z.object({
  favorites_only: z.boolean().default(false).optional(),
  favorite_genres_only: z.boolean().default(false).optional(),
});

interface FiltersFormProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  filters: any;
  setFilters: Dispatch<SetStateAction<ReleasesFilters>>;
}

export function FiltersForm({
  setIsOpen,
  filters,
  setFilters,
}: FiltersFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      favorites_only: filters?.favorites_only || false,
      favorite_genres_only: filters?.favorite_genres_only || false, 
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const updateFilters = async () => {
      let filters: ReleasesFilters = {
        favorites_only: data.favorites_only ?? false,
        favorite_genres_only: data.favorite_genres_only ?? false,
      };
      setFilters(filters);
      setIsOpen(false);
      updateProfileFilters(data);
    };
    updateFilters();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div>
          <div className="space-y-4 rounded-lg border p-4">
            <FormField
              control={form.control}
              name="favorites_only"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Only show my favorite artists
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
              name="favorite_genres_only"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Only show my favorite genres
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
            <div className="flex justify-end">
              <Button type="submit">Apply</Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}