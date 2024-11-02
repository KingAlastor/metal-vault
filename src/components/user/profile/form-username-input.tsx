"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function UserNameField() {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="userName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter a username" {...field} />
          </FormControl>
          <FormDescription>Your public username</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}