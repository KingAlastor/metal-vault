-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "role" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "bands" (
    "name" TEXT NOT NULL,
    "name_pretty" TEXT NOT NULL,
    "genre_tags" VARCHAR[],
    "country" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "followers" INTEGER,
    "archives_link" TEXT NOT NULL,
    "spotify_id" TEXT NOT NULL,

    CONSTRAINT "bands_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "band_albums" (
    "id" TEXT NOT NULL,
    "band_id" TEXT NOT NULL,
    "album_name" TEXT NOT NULL,
    "tracks" JSONB NOT NULL,
    "release_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "band_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "band_followers_0" (
    "id" TEXT NOT NULL,
    "band_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "band_followers_0_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "band_followers_1" (
    "id" TEXT NOT NULL,
    "band_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "band_followers_1_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "bands_genre_tags_idx" ON "bands" USING GIN ("genre_tags");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band_albums" ADD CONSTRAINT "band_albums_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("name") ON DELETE CASCADE ON UPDATE CASCADE;
