-- AlterTable
ALTER TABLE "bands" ALTER COLUMN "genre_tags" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "bands_backup" ALTER COLUMN "genre_tags" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "upcoming_releases" ALTER COLUMN "genre_tags" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "user_posts_active" ALTER COLUMN "genre_tags" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "user_posts_archived" ALTER COLUMN "genre_tags" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "pending_actions" TEXT[] DEFAULT ARRAY[]::TEXT[];
