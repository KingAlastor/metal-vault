-- CreateTable
CREATE TABLE "user_posts_0" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "band_id" TEXT,
    "bandname" TEXT,
    "post_content" TEXT NOT NULL,
    "yt_link" TEXT,
    "spotify_link" TEXT,
    "bandcamp_link" TEXT,

    CONSTRAINT "user_posts_0_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_posts_0_user_id_idx" ON "user_posts_0"("user_id");
