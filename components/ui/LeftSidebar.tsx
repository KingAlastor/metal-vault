"use client";

import Link from "next/link";
import Image from "next/image";
import { sidebarLinks } from "../../constants";
import { usePathname, useRouter } from "next/navigation";

function LeftSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <section className="custom-scrollbar leftsidebar">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`leftsidebar-link ${isActive && "bg-primary-500"}`}
            >
              <div className="flex items-center space-x-2">
                <Image
                  src={link.imgUrl}
                  alt={link.label}
                  width={24}
                  height={24}
                />

                <p className="text-white max-lg:hidden">{link.label}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default LeftSidebar;
