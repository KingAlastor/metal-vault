'use client'

import { sidebarLinks } from "../../constants";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

function Bottombar() {
  const pathname = usePathname();

  return (
    <section className="bottombar">
      <div className="bottombar_container">
      {sidebarLinks.map((link) => (
          <Link
          href={link.route}
          key={link.label}
          className="leftsidebar-link"
          >
          <Image
            src={link.imgUrl}
            alt={link.label}
            width={24}
            height={24}  
          />

          <p className="text-subtle-medium text-light-1 max-sm:hidden">{link.label.split(/\s+/)[0]}</p>
          </Link>
            ))}
      </div>
    </section>

  )  
}

export default Bottombar;