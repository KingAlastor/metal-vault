import Image from "next/image";
import Link from "next/link";

interface PostLinkIconsProps {
  link: string;
  src: string;
  alt: string;
}

const PostLinkIcons = ({ link, src, alt }: PostLinkIconsProps) => {
  return (
    <Link href={link} target="_blank" rel="noopener noreferrer">
      <Image src={src} alt={alt} width={24} height={24} />
    </Link>
  );
};

export default PostLinkIcons;
