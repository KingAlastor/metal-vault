/*
  Warnings:

  - A unique constraint covering the columns `[archives_link]` on the table `bands` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "bands_archives_link_key" ON "bands"("archives_link");
