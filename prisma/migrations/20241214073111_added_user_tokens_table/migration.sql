-- CreateTable
CREATE TABLE "UserTokens" (
    "userId" TEXT NOT NULL,
    "spotify_refresh_token" TEXT NOT NULL,

    CONSTRAINT "UserTokens_pkey" PRIMARY KEY ("userId")
);
