"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lock, LogOut, Settings, Music, Mail, Pencil } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import UserAvatar from "./user-avatar";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession, useUser } from "@/lib/session/client-hooks";
import { logout } from "@/lib/session/server-actions";

export function UserMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isLoading } = useSession();

  const user = useUser(session?.userId);

  const handleLogout = async () => {
    await logout();
    await queryClient.invalidateQueries({ queryKey: ["session"] });
    queryClient.clear();
    router.refresh();
  };

  if (isLoading) {
    return <button disabled>Loading...</button>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex-none rounded-full sm:ms-auto")}>
          <UserAvatar avatarUrl={user?.data?.image} size={40} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{user?.data?.user_name || "User"}</DropdownMenuLabel>
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
          {user?.data?.role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/user/admin">
                <Lock className="mr-2 h-4 w-4" />
                <span className="dropdown-options">Admin</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/user/feedback">
            <Pencil className="mr-2 h-4 w-4" />
            <span className="dropdown-options">Give Feedback</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            onClick={() => handleLogout()}
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
