"use client";

import * as React from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import UserAvatar from "../auth/user-avatar";
import PostDropdownMenu from "./post-dropdown-menu";
import PostLinkIcons from "./post-link-icons";
import { PostCard } from "./post-card";
import { formatDateAndTime } from "@/lib/general/dateTime";
import { Post, PostsProps } from "./post-types";
import { useSessionContext } from "@/app/SessionProvider";

const audioLinks: { source: keyof Post; logo: string; alt: string }[] = [
  {
    source: "yt_link",
    logo: "/YTLogo.svg",
    alt: "YouTube Logo",
  },
  {
    source: "spotify_link",
    logo: "/SpotifyLogo.svg",
    alt: "Spotify Logo",
  },
  {
    source: "bandcamp_link",
    logo: "/BandCampLogo.png",
    alt: "BandCamp Logo",
  },
];

export const Posts = ({ posts }: PostsProps) => {
  const { session: session } = useSessionContext();
  return (
    <>
      {posts.map((post) => {
        return (
          <Card key={post.id} className="mb-4 w-full">
            <CardHeader className="p-4 pt-2 pb-1">
              <div className="flex justify-between items-center"></div>
            </CardHeader>
            <CardContent className="p-4 pt-1 pb-1">
              <PostCard post={post} session={session} />
            </CardContent>
            <CardFooter className="p-4 pt-1 pb-2">
              <div className="flex justify-between items-center w-full">
                <div className="flex space-x-4">
                  {audioLinks.map(
                    (link) =>
                      post[link.source] && (
                        <PostLinkIcons
                          key={link.source}
                          link={post[link.source] as string}
                          src={link.logo}
                          alt={link.alt}
                        />
                      )
                  )}
                </div>
                <div className="flex flex-col items-end text-right">
                  <div className="s-font">
                    {post.user.user_name ? post.user.user_name : post.user.name}
                  </div>
                  <div className="xs-font">
                    {formatDateAndTime(post.post_date_time)}
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </>
  );
};
