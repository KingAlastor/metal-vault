/*
  Warnings:

  - The primary key for the `band_followers_0` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `band_followers_0` table. All the data in the column will be lost.
  - The primary key for the `band_followers_1` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `band_followers_1` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "band_followers_0" DROP CONSTRAINT "band_followers_0_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "band_followers_1" DROP CONSTRAINT "band_followers_1_pkey",
DROP COLUMN "id";
