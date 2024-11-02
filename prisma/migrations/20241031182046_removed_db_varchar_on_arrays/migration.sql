-- AlterTable
ALTER TABLE "bands" ALTER COLUMN "genre_tags" SET DATA TYPE TEXT[];

-- AlterTable
ALTER TABLE "bands_backup" ALTER COLUMN "genre_tags" SET DATA TYPE TEXT[];

-- AlterTable
ALTER TABLE "upcoming_releases" ALTER COLUMN "genre_tags" SET DATA TYPE TEXT[];

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "genre_tags" SET DATA TYPE TEXT[];
