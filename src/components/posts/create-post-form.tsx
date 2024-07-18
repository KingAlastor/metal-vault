"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useRef, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "next-auth";
import { addPost } from "@/lib/data/posts/posts-data-actions";

const initialFormState = {
  post_message: "",
  band_name: "",
  genre: "",
  yt_link: "",
  spotify_link: "",
  bandcamp_link: "",
};

const FormSchema = z.object({
  post_message: z
    .string()
    .min(10, {
      message: "Bio must be at least 10 characters.",
    })
    .max(160, {
      message: "Bio must not be longer than 30 characters.",
    }),
  band_name: z.string().max(30, {
    message: "Bio must not be longer than 30 characters.",
  }),
  genre: z.string().max(40, {
    message: "Bio must not be longer than 30 characters.",
  }),
  yt_link: z.string().max(160, {
    message: "Bio must not be longer than 30 characters.",
  }),
  spotify_link: z.string().max(160, {
    message: "Bio must not be longer than 30 characters.",
  }),
  bandcamp_link: z.string().max(160, {
    message: "Bio must not be longer than 30 characters.",
  }),
});

type PostPageProps = {
  user?: User;
}

export function CreatePost({user}: PostPageProps) {
  const { reset, ...form } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialFormState,
  });

  const router = useRouter();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const MAX_HEIGHT = 200;

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "inherit";
      const newHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = newHeight === MAX_HEIGHT ? "auto" : "hidden";
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("submit was pressed");
    const addNewPost = async () => {
      await addPost(data);
      reset(initialFormState);
      router.push("/");
    };
    addNewPost();
  }

  return (
    <Form reset={reset} {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div>
          <FormField
            control={form.control}
            name="post_message"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about yourself"
                    className="resize-none bg-black text-white"
                    {...field}
                    ref={textareaRef}
                    onInput={adjustTextareaHeight}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex space-x-4">
            <FormField
              control={form.control}
              name="band_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Band</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-black text-white"
                      placeholder="Band name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-black text-white"
                      placeholder="Genre"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-col">
            <FormField
              control={form.control}
              name="yt_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Youtube Link</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-black text-white"
                      placeholder="Youtube Link"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="spotify_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spotify Link</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-black text-white"
                      placeholder="Spotify Link"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bandcamp_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BandCamp Link</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-black text-white"
                      placeholder="BandCamp Link"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Post</Button>
        </div>
      </form>
    </Form>
  );
}
