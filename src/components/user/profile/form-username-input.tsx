"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function UserNameField() {
  const { control } = useFormContext();  return (
    <FormField
      control={control}
      name="user_name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter a username" 
              {...field} 
              value={field.value || ""} 
            />
          </FormControl>
          <FormDescription>Your public username</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}