"use client";

import { signOut } from "next-auth/react"
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
//import avatarPlaceholder from "../../../../public/User.svg"

interface UserButtonProps {
  user: User
}


export function UserMenu({ user }: UserButtonProps) {
  console.log("User button", user);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          User
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{user.name || "User"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
        <DropdownMenuItem asChild>
            <Link href="/user/emailUpdates">
              <Mail className="mr-2 h-4 w-4" />
              <span>Subscribe to Updates</span>
            </Link>
          </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <Link href="/user/followArtists">
              <Music className="mr-2 h-4 w-4" />
              <span>Follow Artists</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/user/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          {user.role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/user/admin">
                <Lock className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}