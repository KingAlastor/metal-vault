import Image from "next/image";
import { Post } from "./posts";
import Link from "next/link";
import useWindowSize from "@/lib/hooks/get-window-size";
import { extractYTID } from "@/lib/hooks/extract-image-base-url";
import { formatDateWithNamedMonth } from "@/lib/general/date";

export const PostCard = (post: Post) => {
  const { name, artist, releaseDate, type, imageUrl } = post.title
    ? JSON.parse(post.title)
    : {};
  const size = useWindowSize();

  let audioUrl;

  if (post.YTLink) {
    audioUrl = post.YTLink;
  } else if (post.SpotifyLink) {
    audioUrl = post.SpotifyLink;
  } else if (post.BandCampLink) {
    audioUrl = post.BandCampLink;
  } else {
    audioUrl = null;
  }

  return (
    <div className="spotify-card p-2">
      {audioUrl ? (
        size.width > 640 ? (
          <div className="flex">
            {imageUrl && (
              <Link href={audioUrl} passHref legacyBehavior>
                <a target="_blank" rel="noopener noreferrer">
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
                </a>
              </Link>
            )}
            <div
              className="flex flex-col justify-between ml-4"
              style={{ height: "158px" }}
            >
              <Link href={audioUrl} passHref legacyBehavior>
                <a target="_blank" rel="noopener noreferrer">
                  <div>
                    {name && <p className="font-bold">{name}</p>}
                    {artist && <p>{artist}</p>}
                    {releaseDate && (
                      <p className="s-font">
                        {formatDateWithNamedMonth(releaseDate)}
                      </p>
                    )}
                    {type && <p className="s-font">{type}</p>}
                    {post.genreTags && (
                      <p className="s-font">{post.genreTags.join(", ")}</p>
                    )}
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
              {imageUrl && (
                <Link href={audioUrl} passHref legacyBehavior>
                  <a target="_blank" rel="noopener noreferrer">
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
                  </a>
                </Link>
              )}
              <div className="flex flex-col justify-between ml-4">
                <Link href={audioUrl} passHref legacyBehavior>
                  <a target="_blank" rel="noopener noreferrer">
                    <div>
                      {name && <p className="font-bold">{name}</p>}
                      {artist && <p>{artist}</p>}
                      {releaseDate && (
                        <p className="s-font">
                          {formatDateWithNamedMonth(releaseDate)}
                        </p>
                      )}
                      {type && <p className="s-font">{type}</p>}
                      {post.genreTags && (
                        <p className="s-font">{post.genreTags.join(", ")}</p>
                      )}
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
            {imageUrl && (
              <Link href={audioUrl} passHref legacyBehavior>
                <a target="_blank" rel="noopener noreferrer">
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
                </a>
              </Link>
            )}
            <div className="flex flex-col justify-between mt-4 w-full text-left">
              <Link href={audioUrl} passHref legacyBehavior>
                <a target="_blank" rel="noopener noreferrer">
                  <div>
                    {name && <p className="font-bold">{name}</p>}
                    {artist && <p>{artist}</p>}
                    {releaseDate && (
                      <p className="s-font">
                        {formatDateWithNamedMonth(releaseDate)}
                      </p>
                    )}
                    {type && <p className="s-font">{type}</p>}
                    {post.genreTags && (
                      <p className="s-font">{post.genreTags.join(", ")}</p>
                    )}
                  </div>
                </a>
              </Link>
            </div>
          </div>
        ) : null
      ) : (
        <div>No audio available</div>
      )}
    </div>
  );
};
