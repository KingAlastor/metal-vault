import { TrackListProps } from "./band-cards-types";

export function TrackList({ tracks }: TrackListProps) {
  return (
    <div className="space-y-2 mt-2">
      {tracks.map((track) => (
        <div key={track.id} className="flex justify-between text-sm">
          <span>
            {track.track_number}. {track.title}
          </span>
          <span>
            {track.duration !== null
              ? `${Math.floor(track.duration / 60)}:${(track.duration % 60)
                  .toString()
                  .padStart(2, "0")}`
              : "N/A"}
          </span>
        </div>
      ))}
    </div>
  );
}
