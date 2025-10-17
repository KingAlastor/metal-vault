CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  user_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  email_status VARCHAR (20) DEFAULT 'ACTIVE',
  location VARCHAR(50),
  image TEXT,
  role VARCHAR(10),
  shard INT DEFAULT 0,
  email_settings JSONB,
  bands_settings JSONB,
  release_settings JSONB,
  posts_settings JSONB,
  events_settings JSONB,
  last_login TIMESTAMP WITH TIME ZONE,
  last_email_sent TIMESTAMP WITH TIME ZONE,
  genre_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  excluded_genre_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  pending_actions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE user_tokens (
  user_id VARCHAR(36) PRIMARY KEY,
  unsubscribe_token VARCHAR(64) UNIQUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE bands (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_pretty VARCHAR(255),
  name_normalized TEXT,
  genre_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  country VARCHAR(255),
  status VARCHAR(255),
  followers INT DEFAULT 0,
  archives_link BIGINT NOT NULL,
  spotify_id VARCHAR(255),
  last_album_sync TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (archives_link)
);
-- Adding extensions for unaccented band names
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Updates the values using the unaccented extension
UPDATE bands SET name_normalized = lower(unaccent(name_pretty));

CREATE OR REPLACE FUNCTION bands_normalize_name()
RETURNS trigger AS $$
BEGIN
  NEW.normalized := lower(unaccent(NEW.name_pretty));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bands_normalize_name_before_ins_upd
BEFORE INSERT OR UPDATE OF name_pretty ON bands
FOR EACH ROW
EXECUTE FUNCTION bands_normalize_name();

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bands_name_normalized_trgm
  ON bands USING gin (name_normalized gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bands_name_pretty_trgm
  ON bands USING gin (name_pretty gin_trgm_ops);

CREATE TABLE bands_backup (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_pretty VARCHAR(255),
  genre_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  country VARCHAR(255),
  status VARCHAR(255),
  followers INT DEFAULT 0,
  archives_link BIGINT,
  spotify_id VARCHAR(255)
);

CREATE TABLE band_albums (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  band_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_pretty VARCHAR(255),
  archives_link BIGINT,
  type VARCHAR(255),
  release_date DATE,
  spotify_id VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (band_id) REFERENCES bands(id) ON DELETE CASCADE,
  UNIQUE (archives_link)
);

CREATE INDEX idx_band_albums_archives_link ON band_albums (archives_link);

CREATE TABLE album_tracks (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  band_id VARCHAR(36) NOT NULL,
  album_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  track_number INT,
  duration INT,
  spotify_id VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (band_id) REFERENCES bands(id) ON DELETE CASCADE,
  FOREIGN KEY (album_id) REFERENCES band_albums(id) ON DELETE CASCADE
);

CREATE TABLE upcoming_releases (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  band_id VARCHAR(36) NOT NULL,
  band_name VARCHAR(255) NOT NULL,
  album_name VARCHAR(255) NOT NULL,
  genre_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  band_archives_link BIGINT,
  album_archives_link BIGINT,
  type VARCHAR(255),
  release_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (album_archives_link)
);

CREATE TABLE band_followers_0 (
  band_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  rating INT DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (band_id) REFERENCES bands(id),
  UNIQUE (user_id, band_id)
);
CREATE INDEX idx_band_followers_0_band_user ON band_followers_0 (band_id, user_id);
CREATE INDEX idx_band_followers_0_user ON band_followers_0 (user_id);

CREATE TABLE band_followers_1 (
  band_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  rating INT DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (band_id) REFERENCES bands(id),
  UNIQUE (user_id, band_id)
);
CREATE INDEX idx_band_followers_1_band_user ON band_followers_1 (band_id, user_id);
CREATE INDEX idx_band_followers_1_user ON band_followers_1 (user_id);

CREATE TABLE band_unfollowers_0 (
  band_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (band_id) REFERENCES bands(id),
  UNIQUE (user_id, band_id)
);
CREATE INDEX idx_band_unfollowers_0_band_user ON band_unfollowers_0 (band_id, user_id);

CREATE TABLE band_unfollowers_1 (
  band_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (band_id) REFERENCES bands(id),
  UNIQUE (user_id, band_id)
);
CREATE INDEX idx_band_unfollowers_1_band_user ON band_unfollowers_1 (band_id, user_id);

CREATE TABLE user_unfollowers_0 (
  user_id VARCHAR(36) NOT NULL,
  unfollowed_user_id VARCHAR(36) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, unfollowed_user_id)
);
CREATE INDEX idx_user_unfollowers_0_users ON user_unfollowers_0(user_id, unfollowed_user_id);

CREATE TABLE user_unfollowers_1 (
  user_id VARCHAR(36) NOT NULL,
  unfollowed_user_id VARCHAR(36) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, unfollowed_user_id)
);
CREATE INDEX idx_user_unfollowers_1_users ON user_unfollowers_1(user_id, unfollowed_user_id);

CREATE TABLE user_posts_active (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(36) NOT NULL,
  band_id VARCHAR(36),
  band_name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  genre_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  post_content TEXT,
  yt_link VARCHAR(255),
  spotify_link VARCHAR(255),
  bandcamp_link VARCHAR(255),
  preview_url VARCHAR(255),
  post_date_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (band_id) REFERENCES bands(id)
);
CREATE INDEX idx_user_posts_active_user_band_tags ON user_posts_active (user_id, band_name);
CREATE INDEX idx_user_posts_active_genre_tags ON user_posts_active USING GIN (genre_tags);

CREATE TABLE user_posts_archived (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(36) NOT NULL,
  band_id VARCHAR(36),
  band_name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  genre_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  post_content TEXT,
  yt_link VARCHAR(255),
  spotify_link VARCHAR(255),
  bandcamp_link VARCHAR(255),
  preview_url VARCHAR(255),
  post_date_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (band_id) REFERENCES bands(id)
);
CREATE INDEX idx_user_posts_archived_user ON user_posts_archived (user_id);

CREATE TABLE user_posts_saved (
  user_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES user_posts_active(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, post_id)
);
CREATE INDEX idx_user_posts_saved_post_user ON user_posts_saved (post_id, user_id);

CREATE TABLE genre_tags (
  genres VARCHAR(100) PRIMARY KEY
);

CREATE TABLE events (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(36) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  venue VARCHAR(255) NOT NULL,
  from_date TIMESTAMP WITH TIME ZONE NOT NULL,
  to_date TIMESTAMP WITH TIME ZONE NOT NULL,
  bands TEXT[] DEFAULT ARRAY[]::TEXT[],
  band_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  genre_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  image_url VARCHAR(255),
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_events_country_dates ON events (country, from_date, to_date);
CREATE INDEX idx_events_band_ids ON events USING GIN (band_ids);
CREATE INDEX idx_events_genre_tags ON events USING GIN (genre_tags);

CREATE TABLE user_events_saved (
  user_id VARCHAR(36) NOT NULL,
  event_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, event_id)
);
CREATE INDEX idx_user_events_saved_event_user ON user_events_saved (event_id, user_id);

CREATE TABLE reported_posts (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  field VARCHAR(255) NOT NULL,
  value VARCHAR(255),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES user_posts_active(id) ON DELETE CASCADE
);

CREATE TABLE user_feedback (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ad_details (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_target_id VARCHAR(36) NOT NULL,
  ad_target_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  filename VARCHAR(255), 
  total_impressions_available INT DEFAULT 1,
  total_impressions INT DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ad_details_ad_target_id ON ad_details (ad_target_id);

CREATE TABLE ad_stats (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_target_id VARCHAR(36) NOT NULL,
  ad_target_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  impressions_source JSONB DEFAULT '{}'::JSONB,
  impressions_by_source JSONB DEFAULT '{}'::JSONB,
  total_impressions_available INT DEFAULT 1,
  total_impressions INT DEFAULT 0,
  ad_content JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
);

CREATE INDEX idx_ad_stats_ad_target_id ON ad_stats (ad_target_id);
CREATE INDEX idx_ad_stats_start_date ON ad_stats (start_date);

-- Function to increment a key in a JSONB object
CREATE OR REPLACE FUNCTION jsonb_increment(
  target_jsonb JSONB,
  key_name TEXT,
  increment_by INT DEFAULT 1
) RETURNS JSONB AS $$
BEGIN
  RETURN target_jsonb || jsonb_build_object(
    key_name, 
    COALESCE((target_jsonb->>key_name)::int, 0) + increment_by
  );
END;
$$ LANGUAGE plpgsql;

-- Usage:
-- UPDATE active_ads 
-- SET impressions_by_source = jsonb_increment(impressions_by_source, 'google', 1)
-- WHERE id = 'some-ad-id';

-- Increment multiple sources at once
-- UPDATE active_ads 
-- SET impressions_by_source = jsonb_increment(
--   jsonb_increment(impressions_by_source, 'google', 1), 
--   'facebook', 1
-- )
-- WHERE id = 'some-ad-id';

CREATE TABLE archived_ads (
  id VARCHAR(36) PRIMARY KEY,  -- Same ID as the active ad
  ad_target_id VARCHAR(36) NOT NULL,
  ad_target_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  impressions_by_source JSONB DEFAULT '{}'::JSONB,
  total_impressions_available INT DEFAULT 1,
  total_impressions INT DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  ad_content JSONB DEFAULT '{}'::JSONB,
  archived_reason VARCHAR(50) NOT NULL, -- 'expired' or 'exhausted'
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ad_billing (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  amount_left DECIMAL(10, 2) DEFAULT 0.00,
  impressions_used INT DEFAULT 0,
  impressions_left INT DEFAULT 0,
  refunded_amount DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

  CREATE INDEX idx_ad_billing_user ON ad_billing (user_id);
