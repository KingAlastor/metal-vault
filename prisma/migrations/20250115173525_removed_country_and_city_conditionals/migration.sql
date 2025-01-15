/*
  Warnings:

  - Made the column `country` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "events" ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL;
