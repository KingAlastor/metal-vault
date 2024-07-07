/*
  Warnings:

  - You are about to drop the column `archives_link` on the `upcoming_releases` table. All the data in the column will be lost.
  - You are about to drop the column `band_id` on the `upcoming_releases` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `upcoming_releases` table. All the data in the column will be lost.
  - You are about to drop the column `name_pretty` on the `upcoming_releases` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[album_archives_link]` on the table `upcoming_releases` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `album_name` to the `upcoming_releases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `band_name` to the `upcoming_releases` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "upcoming_releases" DROP CONSTRAINT "upcoming_releases_band_id_fkey";

-- DropIndex
DROP INDEX "upcoming_releases_archives_link_key";

-- AlterTable
ALTER TABLE "upcoming_releases" DROP COLUMN "archives_link",
DROP COLUMN "band_id",
DROP COLUMN "name",
DROP COLUMN "name_pretty",
ADD COLUMN     "album_archives_link" BIGINT,
ADD COLUMN     "album_name" TEXT NOT NULL,
ADD COLUMN     "band_archives_link" BIGINT,
ADD COLUMN     "band_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "upcoming_releases_album_archives_link_key" ON "upcoming_releases"("album_archives_link");
