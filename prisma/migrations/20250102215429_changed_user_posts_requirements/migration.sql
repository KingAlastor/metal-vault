/*
  Warnings:

  - Made the column `band_id` on table `user_posts_active` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bandname` on table `user_posts_archived` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "user_posts_active" DROP CONSTRAINT "user_posts_active_band_id_fkey";

-- DropIndex
DROP INDEX "user_posts_active_user_id_idx";

-- AlterTable
ALTER TABLE "user_posts_active" ALTER COLUMN "band_id" SET NOT NULL,
ALTER COLUMN "post_content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_posts_archived" ALTER COLUMN "bandname" SET NOT NULL,
ALTER COLUMN "post_content" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "user_posts_active_user_id_bandname_genre_tags_idx" ON "user_posts_active"("user_id", "bandname", "genre_tags");

-- AddForeignKey
ALTER TABLE "user_posts_active" ADD CONSTRAINT "user_posts_active_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
