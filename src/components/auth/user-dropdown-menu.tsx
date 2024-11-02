"use client";

import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "next-auth";
import { Button } from "../ui/button";
import Image from "next/image";
import { Lock, LogOut, Settings, Music, Mail } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle-button";
import { cn } from "@/lib/utils";
import UserAvatar from "./user-avatar";

interface UserButtonProps {
  user: User;
}

export function UserMenu({ user }: UserButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex-none rounded-full sm:ms-auto")}>
          <UserAvatar avatarUrl={user.image} size={40} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{user.name || "User"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/user/emailUpdates">
              <Mail className="mr-2 h-4 w-4" />
              <span className="dropdown-options">Subscribe to Updates</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/user/followArtists">
              <Music className="mr-2 h-4 w-4" />
              <span className="dropdown-options">Follow Artists</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/user/profile">
              <Settings className="mr-2 h-4 w-4" />
              <span className="dropdown-options">Profile</span>
            </Link>
          </DropdownMenuItem>
          {user.role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/user/admin">
                <Lock className="mr-2 h-4 w-4" />
                <span className="dropdown-options">Admin</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <ThemeToggle />
        <DropdownMenuItem asChild>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />{" "}
            <span className="dropdown-options">Sign Out</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
