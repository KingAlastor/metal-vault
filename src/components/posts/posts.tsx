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
  console.table(posts);

  return (
    <div>
      {posts.map((post) => (
        <Card key={post.id} className="bg-black text-white mb-4">
          <CardHeader>
            <div>
              <CardTitle>{post.bandName}</CardTitle>
            </div>
            <CardDescription>Video title</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div className="flex-1 flex flex-col">
                <div>{post.postContent}</div>
                <div className="mt-auto s-font">Genre: {post.genre}</div>
              </div>
              <div className="flex flex-col items-end">
                <Image
                  src="https://i.ytimg.com/vi/WNMFnW34F-0/mqdefault.jpg" // Example external URL
                  alt="Bandcamp Album Cover"
                  width={100}
                  height={100} 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex justify-between items-center w-full">
              <div className="flex space-x-4">
                <span> Links: </span>
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
                        src="/BandcampLogo.png"
                        alt="Bandcamp Logo"
                        width={24}
                        height={24}
                      />
                    </a>
                  </Link>
                )}
              </div>
              <div className="user-info">
                <div className="m-font">{post.user.name}</div>
                <div className="xs-font">{formatDate(post.postDateTime)}</div>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
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
