"use client";

import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usePathname } from "next/navigation";
import { addPost } from "@/lib/data/posts/posts-data-actions";

const initialFormState = {
  post_message: "",
  band_name: "",
  genre: "",
  yt_link: "",
  spotify_link: "",
  bandcamp_link: "",
};

const validYTLink = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
const validSpotifyLink = /^(https?:\/\/)?(open\.spotify\.com)\/.+$/;
const validBandcampLink = /^(https?:\/\/)?([a-z0-9]+\.bandcamp\.com)\/.+$/;

const FormSchema = z
  .object({
    post_message: z.string().optional(),
    band_name: z.string().min(1, {
      message: "Please enter a band name",
    }),
    genre: z.string().optional(),
    yt_link: z
      .string()
      .optional()
      .refine((value) => !value || validYTLink.test(value), {
        message: "Invalid Youtube link",
      }),
    spotify_link: z
      .string()
      .optional()
      .refine((value) => !value || validSpotifyLink.test(value), {
        message: "Invalid Spotify link",
      }),
    bandcamp_link: z
      .string()
      .optional()
      .refine((value) => !value || validBandcampLink.test(value), {
        message: "Invalid Bandcamp link",
      }),
  })
  .refine(
    (data) => {
      return data.yt_link || data.spotify_link || data.bandcamp_link;
    },
    {
      message: "Please fill out at least one of the links (YouTube, Spotify, or Bandcamp)",
      path: ["yt_link"],
    }
  );

type CreatePostFormProps = {
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function CreatePostForm({ setOpen }: CreatePostFormProps) {
  const { reset, ...form } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialFormState,
  });

  const pathname = usePathname();

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
    console.log("component reloaded");
    adjustTextareaHeight();
  }, []);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("submit was pressed");
    const addNewPost = async () => {
      try {
        const post = await addPost(data);
        console.log("previewUpdateCalled");
        reset(initialFormState);
        console.log("pathanme: ", pathname);
        setOpen(false);
        if (pathname === "/") {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error adding post:", error);
      }
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
              <FormItem className="flex flex-row items-center justify-between mb-4">
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about yourself"
                    className="resize-none"
                    {...field}
                    ref={textareaRef}
                    onInput={adjustTextareaHeight}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex space-x-4 mb-4">
            <FormField
              control={form.control}
              name="band_name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Band name" {...field} />
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
                  <FormControl>
                    <Input placeholder="Genre" {...field} />
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
                <FormItem className="mb-4">
                  <FormControl>
                    <Input placeholder="Youtube Link" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="spotify_link"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <Input placeholder="Spotify Link" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bandcamp_link"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <Input placeholder="BandCamp Link" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit">Create Post</Button>
      </form>
    </Form>
  );
}
