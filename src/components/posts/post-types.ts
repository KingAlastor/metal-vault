type PostUser = {
  name: string;
  userName: string | null;
  image: string | null;
  role: string | null;
};

export type Post = {
  id: string;
  userId: string,
  bandId: string | null;
  bandName: string;
  title: string | null;
  genreTags: string[];
  postContent: string | null;
  YTLink: string | null;
  SpotifyLink: string | null;
  BandCampLink: string | null;
  postDateTime: Date;
  previewUrl: string | null;
  isFavorite: boolean;
  isSaved: boolean;
  user: PostUser;
};

export type PostsProps = {
  posts: Post[];
};

export type PostsDataFilters = {
  favorites_only?: boolean;
  favorite_genres_only?: boolean;
  unique_bands: boolean;
};