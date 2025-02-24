// filepath: /c:/TSProjects/metal-vault/src/lib/database-schema-types.ts

export type User = {
  id: string;
  name: string;
  userName?: string;
  email?: string;
  emailVerified: boolean;
  location?: string;
  image?: string;
  role?: string;
  shard?: number;
  emailSettings?: Record<string, unknown>;
  bandsSettings?: Record<string, unknown>;
  releaseSettings?: Record<string, unknown>;
  postsSettings?: Record<string, unknown>;
  lastLogin?: Date;
  genreTags: string[];
  notifications?: Record<string, unknown>;
  pendingActions: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type Account = {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
};

export type Verification = {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserTokens = {
  id: number;
  userId: string;
  provider: string;
  refreshToken: string;
};

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
  albums?: BandAlbum[];
}

export type BandsBackup = {
  id: string;
  name: string;
  namePretty: string;
  genreTags: string[];
  country?: string;
  status?: string;
  followers?: number;
  archivesLink?: bigint;
  spotifyId?: string;
};

export type BandAlbum = {
  id: string;
  name: string;
  name_pretty: string;
  release_date: Date;
  album_tracks: AlbumTrack[];
}

export type AlbumTrack = {
  id: string;
  album_id: string;
  title: string;
  track_number: number;
  duration: number;
}

export type UpcomingReleases = {
  id: string;
  bandId: string;
  bandName: string;
  albumName: string;
  genreTags: string[];
  bandArchivesLink?: bigint;
  albumArchivesLink?: bigint;
  type?: string;
  releaseDate?: Date;
};

export type BandFollowers0 = {
  bandId: string;
  userId: string;
  rating: number;
};

export type BandFollowers1 = {
  bandId: string;
  userId: string;
  rating: number;
};

export type BandUnFollowers0 = {
  bandId: string;
  userId: string;
};

export type BandUnFollowers1 = {
  bandId: string;
  userId: string;
};

export type UserUnFollowers0 = {
  userId: string;
  unfollowedUserId: string;
};

export type UserUnFollowers1 = {
  userId: string;
  unfollowedUserId: string;
};

export type UserPostsActive = {
  id: string;
  userId: string;
  bandId?: string;
  bandName: string;
  title?: string;
  genreTags: string[];
  postContent?: string;
  YTLink?: string;
  SpotifyLink?: string;
  BandCampLink?: string;
  previewUrl?: string;
  postDateTime: Date;
};

export type UserPostsArchived = {
  id: string;
  userId: string;
  bandId?: string;
  bandName: string;
  title?: string;
  genreTags: string[];
  postContent?: string;
  YTLink?: string;
  SpotifyLink?: string;
  BandCampLink?: string;
  previewUrl?: string;
  postDateTime: Date;
};

export type UserPostsSaved = {
  userId: string;
  postId: string;
  createdAt: Date;
};

export type UserEventsSaved = {
  userId: string;
  eventId: string;
  createdAt: Date;
};

export type GenreTags = {
  genres: string;
};

export type Events = {
  id: string;
  userId: string;
  eventName: string;
  country: string;
  city: string;
  fromDate: Date;
  toDate: Date;
  bands: string[];
  bandIds: string[];
  genreTags: string[];
  imageUrl?: string;
  website?: string;
  createdAt: Date;
};

export type ReportedPosts = {
  id: string;
  userId: string;
  postId: string;
  field: string;
  value?: string;
  comment?: string;
  createdAt: Date;
};

export type UserFeedback = {
  id: string;
  userId: string;
  title: string;
  comment: string;
};