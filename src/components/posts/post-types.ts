type PostUser = {
  name: string;
  user_name: string | null;
  image: string | null;
  role: string | null;
};

export type Post = {
  id: string;
  user_id?: string;
  band_id: string | null;
  band_name: string;
  title: string | null;
  genre_tags: string[];
  post_content: string | null;
  yt_link: string | null;
  spotify_link: string | null;
  bandcamp_link: string | null;
  post_date_time: Date;
  preview_url: string | null;
  is_favorite: boolean;
  is_saved: boolean;
  is_owner: boolean; 
  user: PostUser;
};

export type PostsProps = {
  posts: Post[];
};

export type PostsDataFilters = {
  favorites_only?: boolean;
  favorite_genres_only?: boolean;
};