export type Band = {
  namePretty: string
  country: string
  genreTags: string[]
  status: string
  followers: number
  spotifyId: string | null
  albums: {
    id: string
    namePretty: string
    releaseDate: string
    AlbumTracks: {
      id: string
      title: string
      trackNumber: number
      duration: number
    }[]
  }[]
}

export type Album = {
  id: string;
  name: string;
  name_pretty: string;
  album_tracks: {
    id: string;
    title: string;
    track_number: number | null;
    duration: number | null;
  }[];
  release_date: Date | null;
}

export type AlbumListProps = {
  albums: Album[];
}

export type TrackListProps = {
  tracks: Track[];
}

export type Track = {
  id: string;
  title: string;
  track_number: number | null;
  duration: number | null;
}