// filepath: /c:/TSProjects/metal-vault/src/lib/database-schema-types.ts

export type User = {
  id: string;
  name: string;
  user_name?: string;
  email?: string;
  email_verified: boolean;
  location?: string;
  image?: string;
  role?: string;
  shard?: number;
  email_settings?: Record<string, unknown>;
  bands_settings?: Record<string, unknown>;
  release_settings?: Record<string, unknown>;
  posts_settings?: Record<string, unknown>;
  last_login?: Date;
  genre_tags: string[];
  notifications?: Record<string, unknown>;
  pending_actions: string[];
  created_at: Date;
  updated_at: Date;
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

export type UserTokens = {
  id: number;
  user_id: string;
  provider: string;
  refresh_token: string;
};

export type Band = {
  id: string;
  name: string;
  name_pretty: string;
  genre_tags: string[];
  country: string;
  status: string;
  followers: number;
  archives_link: string;
  last_sync: Date | null;
  albums?: BandAlbum[];
}

export type BandsBackup = {
  id: string;
  name: string;
  name_pretty: string;
  genre_tags: string[];
  country?: string;
  status?: string;
  followers?: number;
  archives_link?: bigint;
};

export type BandAlbum = {
  id: string;
  band_id: string;
  name: string;
  name_pretty: string;
  archives_link?: bigint;
  type?: string;
  release_date?: Date;
  updated_at?: Date;
  album_tracks?: AlbumTrack[];
}

export type AlbumTrack = {
  id: string;
  band_id: string;
  album_id: string;
  title: string;
  track_number?: number;
  duration?: number;
  updated_at?: Date;
}

export type UpcomingReleases = {
  id: string;
  band_id: string;
  band_name: string;
  album_name: string;
  genre_tags: string[];
  band_archives_link?: bigint;
  album_archives_link?: bigint;
  type?: string;
  release_date?: Date;
};

export type BandFollowers0 = {
  band_id: string;
  user_id: string;
  rating: number;
};

export type BandFollowers1 = {
  band_id: string;
  user_id: string;
  rating: number;
};

export type BandUnFollowers0 = {
  band_id: string;
  user_id: string;
};

export type BandUnFollowers1 = {
  band_id: string;
  user_id: string;
};

export type UserUnFollowers0 = {
  user_id: string;
  unfollowed_user_id: string;
};

export type UserUnFollowers1 = {
  user_id: string;
  unfollowed_user_id: string;
};

export type UserPostsActive = {
  id: string;
  user_id: string;
  band_id?: string;
  band_name: string;
  title?: string;
  genre_tags: string[];
  post_content?: string;
  yt_link?: string;
  spotify_link?: string;
  band_camp_link?: string;
  preview_url?: string;
  post_date_time: Date;
};

export type UserPostsArchived = {
  id: string;
  user_id: string;
  band_id?: string;
  band_name: string;
  title?: string;
  genre_tags: string[];
  post_content?: string;
  yt_link?: string;
  spotify_link?: string;
  band_camp_link?: string;
  preview_url?: string;
  post_date_time: Date;
};

export type UserPostsSaved = {
  user_id: string;
  post_id: string;
  created_at: Date;
};

export type UserEventsSaved = {
  user_id: string;
  event_id: string;
  created_at: Date;
};

export type GenreTags = {
  genres: string;
};

export type Events = {
  id: string;
  user_id: string;
  event_name: string;
  country: string;
  city: string;
  from_date: Date;
  to_date: Date;
  bands: string[];
  band_ids: string[];
  genre_tags: string[];
  image_url?: string;
  website?: string;
  created_at: Date;
};

export type ReportedPosts = {
  id: string;
  user_id: string;
  post_id: string;
  field: string;
  value?: string;
  comment?: string;
  created_at: Date;
};

export type UserFeedback = {
  id: string;
  user_id: string;
  title: string;
  comment: string;
};