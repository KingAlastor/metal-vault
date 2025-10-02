import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
}

export default function UserAvatar({
  avatarUrl,
  size,
  className,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  // Use placeholder if no URL, if there was an error, or if URL is invalid
  const shouldUsePlaceholder = !avatarUrl || imageError;
  
  // Check if it's an external URL 
  const isExternal = avatarUrl && avatarUrl.startsWith('http');
  
  if (isExternal) {
    // Use regular img tag for external images 
    return (
      <img
        src={shouldUsePlaceholder ? '/avatar-placeholder.png' : avatarUrl}
        alt="User avatar"
        width={size ?? 48}
        height={size ?? 48}
        className={cn(
          "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
          className,
        )}
        onError={() => setImageError(true)}
      />
    );
  }
  
  return (
    <Image
      src={shouldUsePlaceholder ? '/avatar-placeholder.png' : avatarUrl}
      alt="User avatar"
      width={size ?? 48}
      height={size ?? 48}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className,
      )}
      onError={() => setImageError(true)}
    />
  );
}