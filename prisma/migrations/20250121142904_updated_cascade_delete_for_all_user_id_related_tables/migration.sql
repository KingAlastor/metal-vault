-- DropForeignKey
ALTER TABLE "band_followers_0" DROP CONSTRAINT "band_followers_0_user_id_fkey";

-- DropForeignKey
ALTER TABLE "band_followers_1" DROP CONSTRAINT "band_followers_1_user_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_posts_active" DROP CONSTRAINT "user_posts_active_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_posts_archived" DROP CONSTRAINT "user_posts_archived_user_id_fkey";

-- AddForeignKey
ALTER TABLE "band_followers_0" ADD CONSTRAINT "band_followers_0_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band_followers_1" ADD CONSTRAINT "band_followers_1_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_posts_active" ADD CONSTRAINT "user_posts_active_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_posts_archived" ADD CONSTRAINT "user_posts_archived_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
