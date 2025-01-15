/*
  Warnings:

  - You are about to drop the `Events` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Events" DROP CONSTRAINT "Events_user_id_fkey";

-- DropTable
DROP TABLE "Events";

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "fromDate" TIMESTAMP(3),
    "toDate" TIMESTAMP(3),
    "bands" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bandIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "genre_tags" TEXT[],
    "imageUrl" TEXT,
    "website" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_country_fromDate_toDate_bandIds_genre_tags_idx" ON "events"("country", "fromDate", "toDate", "bandIds", "genre_tags");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
