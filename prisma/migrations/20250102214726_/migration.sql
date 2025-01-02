/*
  Warnings:

  - You are about to drop the `user_posts_0` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_posts_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_posts_2` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_posts_3` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_posts_0" DROP CONSTRAINT "user_posts_0_band_id_fkey";

-- DropForeignKey
ALTER TABLE "user_posts_0" DROP CONSTRAINT "user_posts_0_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_posts_1" DROP CONSTRAINT "user_posts_1_band_id_fkey";

-- DropForeignKey
ALTER TABLE "user_posts_1" DROP CONSTRAINT "user_posts_1_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_posts_2" DROP CONSTRAINT "user_posts_2_band_id_fkey";

-- DropForeignKey
ALTER TABLE "user_posts_2" DROP CONSTRAINT "user_posts_2_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_posts_3" DROP CONSTRAINT "user_posts_3_band_id_fkey";

-- DropForeignKey
ALTER TABLE "user_posts_3" DROP CONSTRAINT "user_posts_3_user_id_fkey";

-- DropTable
DROP TABLE "user_posts_0";

-- DropTable
DROP TABLE "user_posts_1";

-- DropTable
DROP TABLE "user_posts_2";

-- DropTable
DROP TABLE "user_posts_3";

-- CreateTable
CREATE TABLE "user_posts_active" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "band_id" TEXT,
    "bandname" TEXT,
    "title" TEXT,
    "genre_tags" TEXT[],
    "post_content" TEXT NOT NULL,
    "yt_link" TEXT,
    "spotify_link" TEXT,
    "bandcamp_link" TEXT,
    "preview_url" TEXT,
    "post_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_posts_active_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_posts_archived" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "band_id" TEXT,
    "bandname" TEXT,
    "title" TEXT,
    "genre_tags" TEXT[],
    "post_content" TEXT NOT NULL,
    "yt_link" TEXT,
    "spotify_link" TEXT,
    "bandcamp_link" TEXT,
    "preview_url" TEXT,
    "post_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_posts_archived_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_posts_active_user_id_idx" ON "user_posts_active"("user_id");

-- CreateIndex
CREATE INDEX "user_posts_archived_user_id_idx" ON "user_posts_archived"("user_id");

-- AddForeignKey
ALTER TABLE "user_posts_active" ADD CONSTRAINT "user_posts_active_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_posts_active" ADD CONSTRAINT "user_posts_active_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_posts_archived" ADD CONSTRAINT "user_posts_archived_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_posts_archived" ADD CONSTRAINT "user_posts_archived_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
