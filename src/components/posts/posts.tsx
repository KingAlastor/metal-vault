"use client";

import * as React from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import useWindowSize from "@/lib/hooks/get-window-size";
import { extractYTID } from "@/lib/hooks/extract-image-base-url";
import UserAvatar from "../auth/user-avatar";
import PostDropdownMenu from "./post-dropdown-menu";
import PostLinkIcons from "./post-link-icons";
import Link from "next/link";

type PostUser = {
  name: string;
  userName: string;
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
  const size = useWindowSize();

  return (
    <div>
      {posts.map((post) => {
        let imageUrl = "";
        if (post.YTLink) {
          const prefix = getImagePrefix(size.width);
          const videoID = extractYTID(post.YTLink);
          imageUrl = getImageUrl(videoID!, prefix);
        }

        return (
          <Card key={post.id} className="mb-4 w-full">
            <CardHeader className="p-4 pt-2 pb-1">
              <div className="flex justify-between items-center">
                <div className="flex">
                  <div className="flex justify-center items-center">
                    <UserAvatar avatarUrl={post.user.image} size={30} />
                  </div>
                  <div className="flex flex-col pl-2">
                    <div>
                      {post.user.userName ? post.user.userName : post.user.name}
                    </div>
                    <div className="xs-font">
                      {formatDate(post.postDateTime)}
                    </div>
                  </div>
                </div>
                <PostDropdownMenu post={post} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1 pb-1">
              <div>
                <p className="mb-3 m-font">{post.postContent}</p>
                {imageUrl && (
                  <div
                    className="relative"
                    style={{
                      width: "100%",
                      maxWidth: "680px",
                      aspectRatio: "680 / 355",
                    }}
                  >
                    <Link href={post.YTLink!} passHref legacyBehavior>
                      <a target="_blank" rel="noopener noreferrer">
                        <Image
                          src={imageUrl}
                          alt="Cropped image"
                          fill
                          sizes="(max-width: 680px) 100vw, 680px"
                          style={{
                            objectFit: "cover",
                            objectPosition: "center",
                          }}
                        />
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-1 pb-2">
              <div className="flex justify-between items-center w-full">
                <div className="flex space-x-4">
                  {post.YTLink && (
                    <PostLinkIcons
                      link={post.YTLink}
                      src="/YTLogo.svg"
                      alt="YouTube Logo"
                    />
                  )}
                  {post.SpotifyLink && (
                    <PostLinkIcons
                      link={post.SpotifyLink}
                      src="/SpotifyLogo.svg"
                      alt="Spotify Logo"
                    />
                  )}
                  {post.BandCampLink && (
                    <PostLinkIcons
                      link={post.BandCampLink}
                      src="/BandcampLogo.svg"
                      alt="Bandcamp Logo"
                    />
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
