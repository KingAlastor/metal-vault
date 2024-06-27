-- CreateTable
CREATE TABLE "bands_backup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_pretty" TEXT NOT NULL,
    "genre_tags" VARCHAR[],
    "country" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "followers" INTEGER,
    "archives_link" TEXT NOT NULL,
    "spotify_id" TEXT,

    CONSTRAINT "bands_backup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bands_backup_genre_tags_idx" ON "bands_backup" USING GIN ("genre_tags");
