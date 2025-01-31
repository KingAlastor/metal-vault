/*
  Warnings:

  - You are about to drop the `ReportedPosts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ReportedPosts";

-- CreateTable
CREATE TABLE "reported_posts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reported_posts_pkey" PRIMARY KEY ("id")
);
