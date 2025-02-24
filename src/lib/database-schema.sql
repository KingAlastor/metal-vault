CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY DEFAULT cuid(),
  name VARCHAR(255) NOT NULL,
  userName VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  emailVerified BOOLEAN DEFAULT false,
  location VARCHAR(255),
  image VARCHAR(255),
  role VARCHAR(255),
  shard INT,
  emailSettings JSON,
  bandsSettings JSON,
  releaseSettings JSON,
  postsSettings JSON,
  lastLogin TIMESTAMP,
  genreTags TEXT[],
  notifications JSON,
  pendingActions TEXT[] DEFAULT ARRAY[]::TEXT[],
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);

CREATE TABLE account (
  id VARCHAR(255) PRIMARY KEY DEFAULT cuid(),
  accountId VARCHAR(255) NOT NULL,
  providerId VARCHAR(255) NOT NULL,
  userId VARCHAR(255) NOT NULL,
  accessToken VARCHAR(255),
  refreshToken VARCHAR(255),
  idToken VARCHAR(255),
  accessTokenExpiresAt TIMESTAMP,
  refreshTokenExpiresAt TIMESTAMP,
  scope VARCHAR(255),
  password VARCHAR(255),
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE session (
  id VARCHAR(255) PRIMARY KEY,
  expiresAt TIMESTAMP NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL,
  ipAddress VARCHAR(255),
  userAgent VARCHAR(255),
  userId VARCHAR(255) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE verification (
  id VARCHAR(255) PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

CREATE TABLE user_tokens (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  refreshToken VARCHAR(255) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (userId, provider)
);

CREATE TABLE bands (
  id VARCHAR(255) PRIMARY KEY DEFAULT cuid(),
  name VARCHAR(255) NOT NULL,
  namePretty VARCHAR(255),
  genreTags TEXT[] DEFAULT ARRAY[]::TEXT[],
  country VARCHAR(255),
  status VARCHAR(255),
  followers INT DEFAULT 0,
  archivesLink BIGINT NOT NULL,
  spotifyId VARCHAR(255),
  lastSync TIMESTAMP,
  UNIQUE (archivesLink)
);

CREATE TABLE bands_backup (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  namePretty VARCHAR(255),
  genreTags TEXT[] DEFAULT ARRAY[]::TEXT[],
  country VARCHAR(255),
  status VARCHAR(255),
  followers INT DEFAULT 0,
  archivesLink BIGINT,
  spotifyId VARCHAR(255)
);

CREATE TABLE band_albums (
  id VARCHAR(255) PRIMARY KEY DEFAULT cuid(),
  bandId VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  namePretty VARCHAR(255),
  archivesLink BIGINT,
  type VARCHAR(255),
  releaseDate TIMESTAMP,
  spotifyId VARCHAR(255),
  updatedAt TIMESTAMP,
  FOREIGN KEY (bandId) REFERENCES bands(id) ON DELETE CASCADE,
  UNIQUE (archivesLink)
);

CREATE TABLE album_tracks (
  id VARCHAR(255) PRIMARY KEY DEFAULT cuid(),
  bandId VARCHAR(255) NOT NULL,
  albumId VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  trackNumber INT,
  duration INT,
  spotifyId VARCHAR(255),
  updatedAt TIMESTAMP,
  FOREIGN KEY (bandId) REFERENCES bands(id) ON DELETE CASCADE,
  FOREIGN KEY (albumId) REFERENCES band_albums(id) ON DELETE CASCADE
);

CREATE TABLE upcoming_releases (
  id VARCHAR(255) PRIMARY KEY DEFAULT cuid(),
  bandId VARCHAR(255) NOT NULL,
  bandName VARCHAR(255) NOT NULL,
  albumName VARCHAR(255) NOT NULL,
  genreTags TEXT[] DEFAULT ARRAY[]::TEXT[],
  bandArchivesLink BIGINT,
  albumArchivesLink BIGINT,
  type VARCHAR(255),
  releaseDate TIMESTAMP,
  UNIQUE (albumArchivesLink)
);

CREATE TABLE band_followers_0 (
  bandId VARCHAR(255) NOT NULL,
  userId VARCHAR(255) NOT NULL,
  rating INT DEFAULT 5,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bandId) REFERENCES bands(id),
  UNIQUE (userId, bandId),
  INDEX (bandId, userId)
);

CREATE TABLE band_followers_1 (
  bandId VARCHAR(255) NOT NULL,
  userId VARCHAR(255) NOT NULL,
  rating INT DEFAULT 5,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bandId) REFERENCES bands(id),
  UNIQUE (userId, bandId),
  INDEX (bandId, userId)
);

CREATE TABLE band_unfollowers_0 (
  bandId VARCHAR(255) NOT NULL,
  userId VARCHAR(255) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bandId) REFERENCES bands(id),
  UNIQUE (userId, bandId),
  INDEX (bandId, userId)
);

CREATE TABLE band_unfollowers_1 (
  bandId VARCHAR(255) NOT NULL,
  userId VARCHAR(255) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bandId) REFERENCES bands(id),
  UNIQUE (userId, bandId),
  INDEX (bandId, userId)
);

CREATE TABLE user_unfollowers_0 (
  userId VARCHAR(255) NOT NULL,
  unfollowedUserId VARCHAR(255) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (userId, unfollowedUserId)
);

CREATE TABLE user_unfollowers_1 (
  userId VARCHAR(255) NOT NULL,
  unfollowedUserId VARCHAR(255) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (userId, unfollowedUserId)
);

CREATE TABLE user_posts_active (
  id VARCHAR(255) PRIMARY KEY DEFAULT cuid(),
  userId VARCHAR(255) NOT NULL,
  bandId VARCHAR(255),
  bandName VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  genreTags TEXT[] DEFAULT ARRAY[]::TEXT[],
  postContent TEXT,
  YTLink VARCHAR(255),
  SpotifyLink VARCHAR(255),
  BandCampLink VARCHAR(255),
  previewUrl VARCHAR(255),
  postDateTime TIMESTAMP DEFAULT now(),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bandId) REFERENCES bands(id),
  INDEX (userId, bandName, genreTags)
);

CREATE TABLE user_posts_archived (
  id VARCHAR(255) PRIMARY KEY DEFAULT cuid(),
  userId VARCHAR(255) NOT NULL,
  bandId VARCHAR(255),
  bandName VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  genreTags TEXT[] DEFAULT ARRAY[]::TEXT[],
  postContent TEXT,
  YTLink VARCHAR(255),
  SpotifyLink VARCHAR(255),
  BandCampLink VARCHAR(255),
  previewUrl VARCHAR(255),
  postDateTime TIMESTAMP DEFAULT now(),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bandId) REFERENCES bands(id),
  INDEX (userId)
);

CREATE TABLE user_posts_saved (
  userId VARCHAR(255) NOT NULL,
  postId VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT now(),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (postId) REFERENCES user_posts_active(id) ON DELETE CASCADE,
  PRIMARY KEY (userId, postId),
  INDEX (postId, userId)
);

CREATE TABLE user_events_saved (
  userId VARCHAR(255) NOT NULL,
  eventId VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT now(),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
  PRIMARY KEY (userId, eventId),
  INDEX (eventId, userId)
);

CREATE TABLE genre_tags (
  genres VARCHAR(255) PRIMARY KEY
);

CREATE TABLE events (
  id VARCHAR(255) PRIMARY KEY DEFAULT cuid(),
  userId VARCHAR(255) NOT NULL,
  eventName VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  fromDate TIMESTAMP NOT NULL,
  toDate TIMESTAMP NOT NULL,
  bands TEXT[] DEFAULT ARRAY[]::TEXT[],
  bandIds TEXT[] DEFAULT ARRAY[]::TEXT[],
  genreTags TEXT[] DEFAULT ARRAY[]::TEXT[],
  imageUrl VARCHAR(255),
  website VARCHAR(255),
  createdAt TIMESTAMP DEFAULT now(),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (country, fromDate, toDate, bandIds, genreTags)
);

CREATE TABLE reported_posts (
  id VARCHAR(255) PRIMARY KEY DEFAULT cuid(),
  userId VARCHAR(255) NOT NULL,
  postId VARCHAR(255) NOT NULL,
  field VARCHAR(255) NOT NULL,
  value VARCHAR(255),
  comment TEXT,
  createdAt TIMESTAMP DEFAULT now(),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (postId) REFERENCES user_posts_active(id) ON DELETE CASCADE
);

CREATE TABLE user_feedback (
  id VARCHAR(255) PRIMARY KEY DEFAULT cuid(),
  userId VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);