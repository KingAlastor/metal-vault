"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usePathname } from "next/navigation";
import { addPost } from "@/lib/data/posts/posts-data-actions";
import { fetchYoutubeVideoData } from "@/lib/apis/YT-api";
import { extractYTID } from "@/lib/hooks/extract-image-base-url";
import {
  fetchSpotifyBandTopTracks,
  fetchSpotifyData,
} from "@/lib/apis/Spotify-api";
import { fetchBandcampData } from "@/lib/apis/Bandcamp-api";
import { BandSearchBar } from "@/components/shared/search-bands-dropdown";
import { Band } from "@/lib/data/bands/search-bands-data-actions";
import {
  MultiSelectDropdown,
  Option,
} from "@/components/shared/multiselect-dropdown";
import { getGenres } from "@/lib/data/genres/genre-data-actions";

const initialFormState = {
  post_message: "",
  band_name: "",
  genreTags: [] as string[],
  testing: [] as string[],
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
    genreTags: z.array(z.string(), {
      message: "Please add at least 1 genre",
    }),
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
      message:
        "Please fill out at least one of the links (YouTube, Spotify, or Bandcamp)",
      path: ["yt_link"],
    }
  );

type CreatePostFormProps = {
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export default function CreatePostForm({ setOpen }: CreatePostFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialFormState,
  });
  const { reset, setValue, control, handleSubmit, watch } = form;

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
    adjustTextareaHeight();
  }, []);

  const [genres, setGenres] = useState<Option[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      const genresData = await getGenres();
      setGenres(
        genresData.map((genre) => ({
          value: genre.genres,
          label: genre.genres,
        }))
      );
    };
    fetchGenres();
  }, []);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const linkData = await getLinkData(data);
      const formData = {
        ...data,
        previewUrl: linkData?.previewUrl,
        title: JSON.stringify(linkData?.title),
      };
      await addPost(formData);
      reset(initialFormState);
      setOpen(false);
      if (pathname === "/") {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error adding post:", error);
    }
  }

  const searchInputProps = {
    inputPlaceholder: "Enter band name",
    clearInput: false,
  };

  const handleBandSelect = (band: Band) => {
    console.log(band);
    setValue("band_name", band.namePretty);
    setValue("genreTags", band.genreTags);
  };

  const genreTags = watch("genreTags");

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={control}
          name="post_message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Add a comment..."
                  className="resize-none"
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
            control={control}
            name="band_name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <BandSearchBar
                    searchInputProps={searchInputProps}
                    onBandSelect={handleBandSelect}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="genreTags"
            render={({ field }) => (
              <FormItem className="flex-1 relative">
                <FormControl>
                  <MultiSelectDropdown
                    options={genres}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                      setValue("genreTags", newValue);
                    }}
                    value={genreTags}
                    triggerText="Select genres"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="yt_link"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Youtube Link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="spotify_link"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Spotify Link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="bandcamp_link"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="BandCamp Link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create Post</Button>
      </form>
    </Form>
  );
}

const getLinkData = async (data: z.infer<typeof FormSchema>) => {
  if (data.yt_link) {
    const videoId = extractYTID(data.yt_link);
    if (videoId) {
      const videoData = await fetchYoutubeVideoData(videoId);
      return {
        title: {
          name: videoData.title,
        },
      };
    } else return null;
  } else if (data.spotify_link) {
    const linkData = await fetchSpotifyData(data.spotify_link);
    switch (linkData.type) {
      case "track":
        return {
          title: {
            name: linkData.data.album.name,
            artist: linkData.data.artists[0].name,
            releaseDate: linkData.data.album.release_date,
            imageUrl: linkData.data.album.images[1].url,
            type: "Track",
          },
          previewUrl: linkData.data.preview_url,
        };
      case "album":
        return {
          title: {
            name: linkData.data.name,
            artist: linkData.data.artists.name,
            releaseDate: linkData.data.release_date,
            type: "Album",
            imageUrl: linkData.data.images[1].url,
          },
          previewUrl: linkData.data.tracks.items[1].preview_url,
        };
      case "artist":
        const topTrackData = await fetchSpotifyBandTopTracks(linkData.data.id);
        return {
          title: {
            name: linkData.data.name,
            type: "Artist",
            imageUrl: linkData.data.images[1].url,
          },
          previewUrl: topTrackData.tracks[0].preview_url,
        };
      default:
        return null;
    }
  } else if (data.bandcamp_link) {
    const bandcampData = await fetchBandcampData(data.bandcamp_link);
    return {
      title: {
        name: bandcampData.trackTitle,
        artist: bandcampData.bandName,
        imageUrl: bandcampData.imgSrc,
      },
    };
  }
};
