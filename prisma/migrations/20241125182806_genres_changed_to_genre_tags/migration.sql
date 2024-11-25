/*
  Warnings:

  - You are about to drop the column `genre` on the `user_posts_0` table. All the data in the column will be lost.
  - You are about to drop the column `genre` on the `user_posts_1` table. All the data in the column will be lost.
  - You are about to drop the column `genre` on the `user_posts_2` table. All the data in the column will be lost.
  - You are about to drop the column `genre` on the `user_posts_3` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_posts_0" DROP COLUMN "genre",
ADD COLUMN     "genre_tags" TEXT[];

-- AlterTable
ALTER TABLE "user_posts_1" DROP COLUMN "genre",
ADD COLUMN     "genre_tags" TEXT[];

-- AlterTable
ALTER TABLE "user_posts_2" DROP COLUMN "genre",
ADD COLUMN     "genre_tags" TEXT[];

-- AlterTable
ALTER TABLE "user_posts_3" DROP COLUMN "genre",
ADD COLUMN     "genre_tags" TEXT[];
