/*
  Warnings:

  - Added the required column `band_id` to the `upcoming_releases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "upcoming_releases" ADD COLUMN     "band_id" TEXT NOT NULL;
