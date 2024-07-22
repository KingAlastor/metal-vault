"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

type PostUser = {
  name: string;
  image: string;
  role: string;
};

type Post = {
  id: string;
  userId: string;
  bandId: string;
  bandName: string;
  genre: string;
  postContent: string;
  YTLink: string | null;
  SpotifyLink: string | null;
  BandCampLink: string | null;
  user: PostUser;
};

export type PostsProps = {
  posts: Post[];
};

export const Posts = ({ posts }: PostsProps) => {
  console.log(posts);

  return (
    <div>
      {posts.map((post) => (
        <Card key={post.id} className="bg-black text-white mb-4">
          <CardHeader>
            <CardTitle>{post.bandName}</CardTitle>
            <CardDescription>{post.genre}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex">
              {post.postContent}
              <div className="logo-links">
                {post.YTLink && (
                  <Link href={post.YTLink} passHref legacyBehavior>
                    <a target="_blank" rel="noopener noreferrer">
                      <Image
                        src="/YTLogo.svg"
                        alt="Logo"
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
                        alt="Logo"
                        width={24}
                        height={24}
                      />
                    </a>
                  </Link>
                )}
                {post.BandCampLink && <Link href={post.BandCampLink} />}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            Posted by {post.user.name}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
