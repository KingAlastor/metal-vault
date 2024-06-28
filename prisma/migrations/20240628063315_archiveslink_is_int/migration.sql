/*
  Warnings:

  - A unique constraint covering the columns `[archives_link]` on the table `band_albums` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `archives_link` to the `band_albums` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `archives_link` on the `bands_backup` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "band_albums" ADD COLUMN     "archives_link" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "bands_backup" DROP COLUMN "archives_link",
ADD COLUMN     "archives_link" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "band_albums_archives_link_key" ON "band_albums"("archives_link");
