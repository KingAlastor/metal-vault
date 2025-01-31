-- CreateTable
CREATE TABLE "ReportedPosts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportedPosts_pkey" PRIMARY KEY ("id")
);
