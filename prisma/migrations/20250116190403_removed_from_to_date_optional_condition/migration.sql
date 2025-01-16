/*
  Warnings:

  - Made the column `fromDate` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `toDate` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "events" ALTER COLUMN "fromDate" SET NOT NULL,
ALTER COLUMN "toDate" SET NOT NULL;
