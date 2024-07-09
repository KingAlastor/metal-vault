/*
  Warnings:

  - A unique constraint covering the columns `[user_id,band_id]` on the table `band_followers_0` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,band_id]` on the table `band_followers_1` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "band_followers_0_band_id_user_id_key";

-- DropIndex
DROP INDEX "band_followers_1_band_id_user_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "band_followers_0_user_id_band_id_key" ON "band_followers_0"("user_id", "band_id");

-- CreateIndex
CREATE UNIQUE INDEX "band_followers_1_user_id_band_id_key" ON "band_followers_1"("user_id", "band_id");
