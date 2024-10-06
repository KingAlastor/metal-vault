"use client";

import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { UserToolTip } from "./user-tooltip";
import useWindowSize from "@/lib/hooks/get-window-size";
import { extractYTID } from "@/lib/hooks/extract-image-base-url";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreVertical } from "lucide-react";
import UserAvatar from "./user-avatar";

type PostUser = {
  name: string;
  image: string;
  role: string;
};

export type Post = {
  id: string;
  userId: string;
  bandId: string;
  bandName: string;
  genre: string;
  postContent: string;
  YTLink: string | null;
  SpotifyLink: string | null;
  BandCampLink: string | null;
  postDateTime: Date;
  user: PostUser;
};

export type PostsProps = {
  posts: Post[];
};

export const Posts = ({ posts }: PostsProps) => {
/*   console.table("logging posts");
 */  const size = useWindowSize();
  console.log("window size", size);

  const handleAddToFavoritesClick = () => {
    console.log("clicked");
  };

  return (
    <div>
      {posts.map((post) => {
        let imageUrl = "";
        if (post.YTLink) {
          const prefix = getImagePrefix(size.width);
/*           console.log("prefix", prefix);
 */          const videoID = extractYTID(post.YTLink);
/*           console.log("video ID:", videoID, "YT Link: ", post.YTLink);
 */          imageUrl = getImageUrl(videoID!, prefix);
/*           console.log("img url: ", imageUrl); */
        }
        console.log("User image: ", post.user.image);

        return (
          <Card key={post.id} className="text-white mb-4 max-width">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-start">
                  <div className="flex items-center">
                    <UserToolTip user={post.user}>
                      <Link href={`/user/${post.user.name}`}>
                        <UserAvatar avatarUrl={post.user.image} />
                      </Link>
                    </UserToolTip>
                  </div>
                  <div className="xs-font ml-2">
                    {formatDate(post.postDateTime)}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleAddToFavoritesClick}>
                      <div className="dropdown-options">Save post</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAddToFavoritesClick}>
                      <div className="dropdown-options">Report Post</div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <p className="mb-3">{post.postContent}</p>
                {imageUrl && (
                  <div className="w-full max-w-[680px] max-h-[355px] overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt="YouTube Thumbnail"
                      layout="responsive"
                      width={680}
                      height={355}
                      className="object-fit: cover w-full h-full"
                      style={{ objectPosition: "center center" }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-between items-center w-full">
                <div className="flex space-x-4">
                  {size.width > 600 && <span> Links: </span>}
                  {post.YTLink && (
                    <Link href={post.YTLink} passHref legacyBehavior>
                      <a target="_blank" rel="noopener noreferrer">
                        <Image
                          src="/YTLogo.svg"
                          alt="YouTube Logo"
                          width={24}
                          height={24}
                        />
                      </a>
                    </Link>
                  )}
                  {post.SpotifyLink && (
                    <Link href={post.SpotifyLink} passHref legacyBehavior>
                      <a target="_blank" rel="noopener noreferrer">
                        <Image
                          src="/SpotifyLogo.svg"
                          alt="Spotify Logo"
                          width={24}
                          height={24}
                        />
                      </a>
                    </Link>
                  )}
                  {post.BandCampLink && (
                    <Link href={post.BandCampLink} passHref legacyBehavior>
                      <a target="_blank" rel="noopener noreferrer">
                        <Image
                          src="/BandcampLogo.svg"
                          alt="Bandcamp Logo"
                          width={24}
                          height={24}
                        />
                      </a>
                    </Link>
                  )}
                </div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

const formatDate = (date: Date) => {
  const d = new Date(date);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const hour = d.getHours().toString().padStart(2, "0");
  const minute = d.getMinutes().toString().padStart(2, "0");

  return `${month} ${day} ${hour}:${minute}`;
};

const getImageUrl = (videoId: string, prefix: string) => {
  return `https://i.ytimg.com/vi/${videoId}/${prefix}default.jpg`;
};

const getImagePrefix = (width: number) => {
  if (width <= 480) return "sd";
  return "hq";
};
