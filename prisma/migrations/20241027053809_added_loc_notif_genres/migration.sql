-- AlterTable
ALTER TABLE "users" ADD COLUMN     "genre_tags" VARCHAR[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "notifications" JSONB,
ADD COLUMN     "userName" TEXT;
