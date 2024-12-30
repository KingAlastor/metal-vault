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
import { BandCampCard, SpotifyCard, YTCard } from "./post-cards";
import { formatDateAndTime } from "@/lib/general/date";

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
  title: string;
  genre: string;
  postContent: string;
  YTLink: string | null;
  SpotifyLink: string | null;
  BandCampLink: string | null;
  postDateTime: Date;
  previewUrl: string;
  user: PostUser;
};

export type PostsProps = {
  posts: Post[];
};

const audioLinks: { source: keyof Post; logo: string; alt: string }[] = [
  {
    source: "YTLink",
    logo: "/YTLogo.svg",
    alt: "YouTube Logo",
  },
  {
    source: "SpotifyLink",
    logo: "/SpotifyLogo.svg",
    alt: "Spotify Logo",
  },
  {
    source: "BandCampLink",
    logo: "/BandCampLogo.png",
    alt: "BandCamp Logo",
  },
];

export const Posts = ({ posts }: PostsProps) => {
  return (
    <div>
      {posts.map((post) => {
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
                      {formatDateAndTime(post.postDateTime)}
                    </div>
                  </div>
                </div>
                <PostDropdownMenu post={post} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1 pb-1">
              {post.YTLink ? (
                <YTCard {...post} />
              ) : post.SpotifyLink ? (
                <SpotifyCard {...post} />
              ) : post.BandCampLink ? (
                <BandCampCard {...post} />
              ) : null}
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
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
