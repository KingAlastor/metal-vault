-- CreateTable
CREATE TABLE "Events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "bands" TEXT[],
    "genre_tags" TEXT[],
    "website" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
