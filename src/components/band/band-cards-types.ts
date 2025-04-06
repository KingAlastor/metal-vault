export type Band = {
  id: string;
  name: string;
  name_pretty: string;
  genre_tags: string[];
  country: string;
  status: string;
  followers: number;
  spotify_id: string | null;
  archives_link: string;
  last_sync: Date | null;
  albums?: Album[];
}

export type Album = {
  id: string;
  band_id: string;
  name: string;
  name_pretty: string;
  archives_link?: bigint;
  type?: string;
  release_date?: Date;
  spotify_id?: string;
  updated_at?: Date;
  album_tracks?: {
    id: string;
    band_id: string;
    album_id: string;
    title: string;
    track_number?: number;
    duration?: number;
    spotify_id?: string;
    updated_at?: Date;
  }[];
}

export type AlbumListProps = {
  albums: Album[];
}

export type TrackListProps = {
  tracks: Track[];
}

export type Track = {
  id: string;
  band_id: string;
  album_id: string;
  title: string;
  track_number?: number;
  duration?: number;
  spotify_id?: string;
  updated_at?: Date;
}