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
import { fetchYoutubeVideoData } from "@/lib/apis/YT-api";

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
};

export function CreatePost({ user }: PostPageProps) {
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
      try {
        const post = await addPost(data);
        console.log("Post added successfully:", post);
        await updatePreviewAndTitle(post);
        console.log("previewUpdateCalled");
        reset(initialFormState);
        router.push("/");
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

const updatePreviewAndTitle = async (post: any) => {
  let medialink: string | undefined;
  let source: string | undefined;

  console.log("post:", post);
  console.log("post.yt_link:", post.YTLink);

  if (post.YTLink) {
    medialink = post.YTLink;
    source = "YT";
  }

  console.log("medialink:", medialink);
  console.log("source:", source);

  if (medialink && source) {
    const videoData = await fetchPreviewUrl(medialink, source);
    console.log(videoData);
  }
};

const fetchPreviewUrl = async (medialink: string, source: string) => {
  console.log("fetchPreviewUrl called with:", medialink, source);
  switch (source) {
    case "YT":
      const regExp =
        /(?:https?:\/\/)?(?:www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = regExp.exec(medialink);
      if (match && match[2]) {
        const videoId = match[2]; // Correctly extract the video ID
        console.log(videoId);
        const previewUrl = await fetchYoutubeVideoData(videoId);
        console.log("previewUrl:", previewUrl);
        return previewUrl;
      } else {
        console.log("No match found for YT link");
        return null;
      }
    case "SPOTIFY":
      // Code for case 2
      break;
    case "BC":
      // Code for case 3
      break;
    default:
      console.log("Unknown source");
      return null;
  }
};
