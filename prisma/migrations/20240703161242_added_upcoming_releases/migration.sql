-- AlterTable
ALTER TABLE "band_albums" ALTER COLUMN "archives_link" DROP NOT NULL;

-- AlterTable
ALTER TABLE "bands_backup" ALTER COLUMN "archives_link" DROP NOT NULL;

-- CreateTable
CREATE TABLE "upcoming_releases" (
    "id" TEXT NOT NULL,
    "band_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_pretty" TEXT NOT NULL,
    "genre_tags" VARCHAR[],
    "archives_link" BIGINT,
    "type" TEXT,
    "release_date" TIMESTAMP(3),

    CONSTRAINT "upcoming_releases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "upcoming_releases_archives_link_key" ON "upcoming_releases"("archives_link");

-- AddForeignKey
ALTER TABLE "upcoming_releases" ADD CONSTRAINT "upcoming_releases_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
