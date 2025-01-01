-- AddForeignKey
ALTER TABLE "band_followers_0" ADD CONSTRAINT "band_followers_0_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band_followers_1" ADD CONSTRAINT "band_followers_1_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
