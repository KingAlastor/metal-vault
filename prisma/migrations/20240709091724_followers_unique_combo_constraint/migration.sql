/*
  Warnings:

  - A unique constraint covering the columns `[band_id,user_id]` on the table `band_followers_0` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[band_id,user_id]` on the table `band_followers_1` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "band_followers_0_band_id_user_id_key" ON "band_followers_0"("band_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "band_followers_1_band_id_user_id_key" ON "band_followers_1"("band_id", "user_id");
