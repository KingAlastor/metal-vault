/*
  Warnings:

  - You are about to drop the column `album_name` on the `band_albums` table. All the data in the column will be lost.
  - You are about to drop the column `tracks` on the `band_albums` table. All the data in the column will be lost.
  - Added the required column `name` to the `band_albums` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_pretty` to the `band_albums` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `band_albums` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "band_albums" DROP COLUMN "album_name",
DROP COLUMN "tracks",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "name_pretty" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
