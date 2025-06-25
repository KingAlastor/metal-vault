import Image from "next/image";
import Link from "next/link";
import useWindowSize from "@/lib/hooks/get-window-size";
import { formatDateWithNamedMonth } from "@/lib/general/dateTime";
import { Post } from "./post-types";

export const PostCard = (post: Post) => {
  const { name, artist, releaseDate, type, imageUrl } = post.title
    ? JSON.parse(post.title)
    : {};
  const size = useWindowSize();

  let audioUrl;

  if (post.yt_link) {
    audioUrl = post.yt_link;
  } else if (post.spotify_link) {
    audioUrl = post.spotify_link;
  } else if (post.bandcamp_link) {
    audioUrl = post.bandcamp_link;
  } else {
    audioUrl = null;
  }

  return (
    <div className="spotify-card p-2">
      {audioUrl ? (
        size.width > 640 ? (
          <div className="flex">
            {imageUrl && (
              <Link href={audioUrl} target="_blank" rel="noopener noreferrer">
                <div
                  style={{
                    position: "relative",
                    width: "158px",
                    height: "158px",
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt="Cropped image"
                    fill
                    sizes="158px"
                    style={{
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                  />
                </div>
              </Link>
            )}
            <div
              className="flex flex-col justify-between ml-4"
              style={{ height: "158px" }}
            >
              <Link href={audioUrl} target="_blank" rel="noopener noreferrer">
                <>
                  {name && <p className="font-bold">{name}</p>}
                  {artist && <p>{artist}</p>}
                  {releaseDate && (
                    <p className="s-font">
                      {formatDateWithNamedMonth(releaseDate)}
                    </p>
                  )}
                  {type && <p className="s-font">{type}</p>}
                  {post.genre_tags && (
                    <p className="s-font">{post.genre_tags.join(", ")}</p>
                  )}
                </>
              </Link>
              {post.preview_url && (
                <audio controls className="mt-2">
                  <source src={post.preview_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          </div>
        ) : size.width <= 640 && size.width > 400 ? (
          <div className="flex flex-col">
            <div className="flex">
              {imageUrl && (
                <Link href={audioUrl} target="_blank" rel="noopener noreferrer">
                  <div
                    style={{
                      position: "relative",
                      width: "158px",
                      height: "158px",
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt="Cropped image"
                      fill
                      sizes="158px"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                </Link>
              )}
              <div className="flex flex-col justify-between ml-4">
                <Link href={audioUrl} target="_blank" rel="noopener noreferrer">
                  <>
                    {name && <p className="font-bold">{name}</p>}
                    {artist && <p>{artist}</p>}
                    {releaseDate && (
                      <p className="s-font">
                        {formatDateWithNamedMonth(releaseDate)}
                      </p>
                    )}
                    {type && <p className="s-font">{type}</p>}
                    {post.genre_tags && (
                      <p className="s-font">{post.genre_tags.join(", ")}</p>
                    )}
                  </>
                </Link>
              </div>
            </div>
            {post.preview_url && (
              <audio controls className="mt-2">
                <source src={post.preview_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        ) : size.width <= 400 ? (
          <div className="flex flex-col items-center">
            {imageUrl && (
              <Link href={audioUrl} target="_blank" rel="noopener noreferrer">
                <div
                  style={{
                    position: "relative",
                    width: "158px",
                    height: "158px",
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt="Cropped image"
                    fill
                    sizes="158px"
                    style={{
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                  />
                </div>
              </Link>
            )}
            <div className="flex flex-col justify-between mt-4 w-full text-left">
              <Link href={audioUrl} target="_blank" rel="noopener noreferrer">
                <>
                  {name && <p className="font-bold">{name}</p>}
                  {artist && <p>{artist}</p>}
                  {releaseDate && (
                    <p className="s-font">
                      {formatDateWithNamedMonth(releaseDate)}
                    </p>
                  )}
                  {type && <p className="s-font">{type}</p>}
                  {post.genre_tags && (
                    <p className="s-font">{post.genre_tags.join(", ")}</p>
                  )}
                </>
              </Link>
            </div>
          </div>
        ) : null
      ) : (
        <>No audio available</>
      )}
    </div>
  );
};
