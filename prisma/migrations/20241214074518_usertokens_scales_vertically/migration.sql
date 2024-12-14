/*
  Warnings:

  - The primary key for the `UserTokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `spotify_refresh_token` on the `UserTokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,source]` on the table `UserTokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `source` to the `UserTokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `UserTokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserTokens" DROP CONSTRAINT "UserTokens_pkey",
DROP COLUMN "spotify_refresh_token",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "source" TEXT NOT NULL,
ADD COLUMN     "token" TEXT NOT NULL,
ADD CONSTRAINT "UserTokens_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserTokens_userId_source_key" ON "UserTokens"("userId", "source");
