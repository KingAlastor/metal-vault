/*
  Warnings:

  - Made the column `bandname` on table `user_posts_active` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "user_posts_active" DROP CONSTRAINT "user_posts_active_band_id_fkey";

-- AlterTable
ALTER TABLE "user_posts_active" ALTER COLUMN "band_id" DROP NOT NULL,
ALTER COLUMN "bandname" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "user_posts_active" ADD CONSTRAINT "user_posts_active_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
