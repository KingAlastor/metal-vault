-- AlterTable
ALTER TABLE "user_posts_0" ADD COLUMN     "post_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "posts_settings" JSONB;

-- CreateTable
CREATE TABLE "user_posts_1" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "band_id" TEXT,
    "bandname" TEXT,
    "genre" TEXT,
    "post_content" TEXT NOT NULL,
    "yt_link" TEXT,
    "spotify_link" TEXT,
    "bandcamp_link" TEXT,
    "post_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_posts_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_posts_2" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "band_id" TEXT,
    "bandname" TEXT,
    "genre" TEXT,
    "post_content" TEXT NOT NULL,
    "yt_link" TEXT,
    "spotify_link" TEXT,
    "bandcamp_link" TEXT,
    "post_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_posts_2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_posts_3" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "band_id" TEXT,
    "bandname" TEXT,
    "genre" TEXT,
    "post_content" TEXT NOT NULL,
    "yt_link" TEXT,
    "spotify_link" TEXT,
    "bandcamp_link" TEXT,
    "post_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_posts_3_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_posts_1_user_id_idx" ON "user_posts_1"("user_id");

-- CreateIndex
CREATE INDEX "user_posts_2_user_id_idx" ON "user_posts_2"("user_id");

-- CreateIndex
CREATE INDEX "user_posts_3_user_id_idx" ON "user_posts_3"("user_id");

-- AddForeignKey
ALTER TABLE "user_posts_0" ADD CONSTRAINT "user_posts_0_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_posts_1" ADD CONSTRAINT "user_posts_1_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_posts_2" ADD CONSTRAINT "user_posts_2_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_posts_3" ADD CONSTRAINT "user_posts_3_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
