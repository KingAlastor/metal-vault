/*
  Warnings:

  - You are about to drop the `UserTokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserTokens" DROP CONSTRAINT "UserTokens_userId_fkey";

-- DropTable
DROP TABLE "UserTokens";

-- CreateTable
CREATE TABLE "user_tokens" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "user_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_tokens_userId_provider_key" ON "user_tokens"("userId", "provider");

-- AddForeignKey
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
