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
import { PostCard } from "./post-cards";
import { formatDateAndTime } from "@/lib/general/date";

type PostUser = {
  name: string;
  userName: string | null;
  image: string | null;
  role: string | null;
};

export type Post = {
  id: string;
  bandId: string | null;
  bandName: string;
  title: string | null;
  genreTags: string[];
  postContent: string | null;
  YTLink: string | null;
  SpotifyLink: string | null;
  BandCampLink: string | null;
  postDateTime: Date;
  previewUrl: string | null;
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
  console.log("posts: ", posts);
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
                <PostDropdownMenu {...post} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1 pb-1">
              <PostCard {...post} />
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
