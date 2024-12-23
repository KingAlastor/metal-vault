import Image from "next/image";
import { Post } from "./posts";
import Link from "next/link";
import useWindowSize from "@/lib/hooks/get-window-size";
import { extractYTID } from "@/lib/hooks/extract-image-base-url";
import { formatDateWithNamedMonth } from "@/lib/general/date";

export const YTCard = (post: Post) => {
  const size = useWindowSize();
  const { name } = JSON.parse(post.title);

  const prefix = getImagePrefix(size.width);
  const videoID = extractYTID(post.YTLink!);
  const imageUrl = getImageUrl(videoID!, prefix);
  return (
    <div>
      <p className="mb-3 m-font">{post.postContent}</p>
      {imageUrl && (
        <div
          className="relative"
          style={{
            width: "100%",
            maxWidth: "680px",
            aspectRatio: "680 / 355",
          }}
        >
          <Link href={post.YTLink!} passHref legacyBehavior>
            <a target="_blank" rel="noopener noreferrer">
              <Image
                src={imageUrl}
                alt="Cropped image"
                priority={true}
                fill
                sizes="(max-width: 680px) 100vw, 680px"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </a>
          </Link>
        </div>
      )}
      {name && <p className="mt-1">{name}</p>}
    </div>
  );
};

export const SpotifyCard = (post: Post) => {
  const { name, artist, releaseDate, type, imageUrl } = JSON.parse(post.title);
  const size = useWindowSize();

  return (
    <div className="spotify-card p-2">
      {size.width > 640 ? (
        <div className="flex">
          <Link href={post.SpotifyLink!} passHref legacyBehavior>
            <a target="_blank" rel="noopener noreferrer">
              <Image
                src={imageUrl}
                alt="Cropped image"
                width={158}
                height={158}
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </a>
          </Link>
          <div
            className="flex flex-col justify-between ml-4"
            style={{ height: "158px" }}
          >
            <Link href={post.SpotifyLink!} passHref legacyBehavior>
              <a target="_blank" rel="noopener noreferrer">
                <div>
                  {name && <p className="font-bold">{name}</p>}
                  {artist && <p>{artist}</p>}
                  {releaseDate && (
                    <p className="s-font">
                      {formatDateWithNamedMonth(releaseDate)}
                    </p>
                  )}
                  {type && <p className="m-font">{type}</p>}
                </div>
              </a>
            </Link>
            {post.previewUrl && (
              <audio controls className="mt-2">
                <source src={post.previewUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        </div>
      ) : size.width <= 640 && size.width > 400 ? (
        <div className="flex flex-col">
          <div className="flex">
            <Link href={post.SpotifyLink!} passHref legacyBehavior>
              <a target="_blank" rel="noopener noreferrer">
                <Image
                  src={imageUrl}
                  alt="Cropped image"
                  width={158}
                  height={158}
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              </a>
            </Link>
            <div className="flex flex-col justify-between ml-4">
              <Link href={post.SpotifyLink!} passHref legacyBehavior>
                <a target="_blank" rel="noopener noreferrer">
                  <div>
                    {name && <p className="font-bold">{name}</p>}
                    {artist && <p>{artist}</p>}
                    {releaseDate && (
                      <p className="s-font">
                        {formatDateWithNamedMonth(releaseDate)}
                      </p>
                    )}
                    {type && <p className="m-font">{type}</p>}
                  </div>
                </a>
              </Link>
            </div>
          </div>
          {post.previewUrl && (
            <audio controls className="mt-2">
              <source src={post.previewUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      ) : size.width <= 400 ? (
        <div className="flex flex-col items-center">
          <Link href={post.SpotifyLink!} passHref legacyBehavior>
            <a target="_blank" rel="noopener noreferrer">
              <Image
                src={imageUrl}
                alt="Cropped image"
                width={158}
                height={158}
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </a>
          </Link>
          <div className="flex flex-col justify-between mt-4 w-full text-left">
            <Link href={post.SpotifyLink!} passHref legacyBehavior>
              <a target="_blank" rel="noopener noreferrer">
                <div>
                  {name && <p className="font-bold">{name}</p>}
                  {artist && <p>{artist}</p>}
                  {releaseDate && (
                    <p className="s-font">
                      {formatDateWithNamedMonth(releaseDate)}
                    </p>
                  )}
                  {type && <p className="m-font">{type}</p>}
                </div>
              </a>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const BandCampCard = (post: Post) => {
  const { name, artist, releaseDate, type, imageUrl } = JSON.parse(post.title);

  return (
    <div>
      <p className="mb-3 m-font">{post.postContent}</p>
      {imageUrl && (
        <div
          className="relative"
          style={{
            width: "100%",
            maxWidth: "680px",
            aspectRatio: "680 / 355",
          }}
        >
          <Link href={post.BandCampLink!} passHref legacyBehavior>
            <a target="_blank" rel="noopener noreferrer">
              <Image
                src={imageUrl}
                alt="Cropped image"
                priority={true}
                fill
                sizes="(max-width: 680px) 100vw, 680px"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </a>
          </Link>
        </div>
      )}
      <div>
        {name && <p className="font-bold">{name}</p>}
        {artist && <p>{artist}</p>}
      </div>
    </div>
  );
};

const getImageUrl = (videoId: string, prefix: string) => {
  return `https://i.ytimg.com/vi/${videoId}/${prefix}default.jpg`;
};

const getImagePrefix = (width: number) => {
  if (width <= 480) return "sd";
  return "hq";
};
