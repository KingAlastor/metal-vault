/*
  Warnings:

  - You are about to drop the `verificationtokens` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `archives_link` on the `bands` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "band_albums" ALTER COLUMN "release_date" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "archives_link" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "bands" ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
DROP COLUMN "archives_link",
ADD COLUMN     "archives_link" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "bands_backup" ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "archives_link" SET DATA TYPE BIGINT;

-- DropTable
DROP TABLE "verificationtokens";

-- CreateIndex
CREATE UNIQUE INDEX "bands_archives_link_key" ON "bands"("archives_link");
