/*
  Warnings:

  - You are about to drop the column `source` on the `UserTokens` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `UserTokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,provider]` on the table `UserTokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider` to the `UserTokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `UserTokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserTokens_userId_source_key";

-- AlterTable
ALTER TABLE "UserTokens" DROP COLUMN "source",
DROP COLUMN "token",
ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserTokens_userId_provider_key" ON "UserTokens"("userId", "provider");

-- AddForeignKey
ALTER TABLE "UserTokens" ADD CONSTRAINT "UserTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
