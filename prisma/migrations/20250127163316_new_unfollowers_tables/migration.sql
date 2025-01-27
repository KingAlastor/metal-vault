-- CreateTable
CREATE TABLE "band_unfollowers_0" (
    "band_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "band_unfollowers_1" (
    "band_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "band_unfollowers_0_band_id_user_id_idx" ON "band_unfollowers_0"("band_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "band_unfollowers_0_user_id_band_id_key" ON "band_unfollowers_0"("user_id", "band_id");

-- CreateIndex
CREATE INDEX "band_unfollowers_1_band_id_user_id_idx" ON "band_unfollowers_1"("band_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "band_unfollowers_1_user_id_band_id_key" ON "band_unfollowers_1"("user_id", "band_id");

-- AddForeignKey
ALTER TABLE "band_unfollowers_0" ADD CONSTRAINT "band_unfollowers_0_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band_unfollowers_0" ADD CONSTRAINT "band_unfollowers_0_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band_unfollowers_1" ADD CONSTRAINT "band_unfollowers_1_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band_unfollowers_1" ADD CONSTRAINT "band_unfollowers_1_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
