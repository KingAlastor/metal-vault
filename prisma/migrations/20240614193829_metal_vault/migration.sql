/*
  Warnings:

  - The primary key for the `bands` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `bands` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "band_albums" DROP CONSTRAINT "band_albums_band_id_fkey";

-- AlterTable
ALTER TABLE "bands" DROP CONSTRAINT "bands_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "bands_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "band_albums" ADD CONSTRAINT "band_albums_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
