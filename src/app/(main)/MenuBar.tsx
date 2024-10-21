import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  return (
    <div className={className}>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Upcoming Releases"
        asChild
      >
        <Link href="/releases">
        <Image
            src="/Vinyl.svg"
            alt="Upcoming Release"
            width={24}
            height={24}
          />
          <span className="hidden lg:inline">Upcoming Releases</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Recommendations"
        asChild
      >
        <Link href="/recommendations">
          <Image
            src="/ThumbUp.svg"
            alt="Recommendations"
            width={24}
            height={24}
          />
          <span className="hidden lg:inline">Recommendations</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Events"
        asChild
      >
        <Link href="/events">
        <Image
            src="/Events.svg"
            alt="Events"
            width={24}
            height={24}
          />
          <span className="hidden lg:inline">Events</span>
        </Link>
      </Button>
    </div>
  );
}
