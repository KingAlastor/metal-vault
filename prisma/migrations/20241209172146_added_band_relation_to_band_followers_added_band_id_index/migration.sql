-- DropIndex
DROP INDEX "band_followers_0_user_id_idx";

-- DropIndex
DROP INDEX "band_followers_1_user_id_idx";

-- CreateIndex
CREATE INDEX "band_followers_0_band_id_user_id_idx" ON "band_followers_0"("band_id", "user_id");

-- CreateIndex
CREATE INDEX "band_followers_1_band_id_user_id_idx" ON "band_followers_1"("band_id", "user_id");

-- AddForeignKey
ALTER TABLE "band_followers_0" ADD CONSTRAINT "band_followers_0_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band_followers_1" ADD CONSTRAINT "band_followers_1_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
