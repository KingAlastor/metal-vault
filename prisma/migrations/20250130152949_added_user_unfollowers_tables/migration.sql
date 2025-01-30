-- CreateTable
CREATE TABLE "user_unfollowers_0" (
    "user_id" TEXT NOT NULL,
    "unfollowed_user_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user_unfollowers_1" (
    "user_id" TEXT NOT NULL,
    "unfollowed_user_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_unfollowers_0_user_id_unfollowed_user_id_key" ON "user_unfollowers_0"("user_id", "unfollowed_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_unfollowers_1_user_id_unfollowed_user_id_key" ON "user_unfollowers_1"("user_id", "unfollowed_user_id");

-- AddForeignKey
ALTER TABLE "user_unfollowers_0" ADD CONSTRAINT "user_unfollowers_0_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_unfollowers_1" ADD CONSTRAINT "user_unfollowers_1_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
