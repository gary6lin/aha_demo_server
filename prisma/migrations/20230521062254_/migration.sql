/*
  Warnings:

  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Profile";

-- CreateTable
CREATE TABLE "UserCopy" (
    "uid" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL,
    "displayName" TEXT,
    "photoURL" TEXT,
    "passwordHash" TEXT,
    "passwordSalt" TEXT,
    "tokensValidAfterTime" TIMESTAMP(3),
    "creationTime" TIMESTAMP(3) NOT NULL,
    "lastSignInTime" TIMESTAMP(3) NOT NULL,
    "lastRefreshTime" TIMESTAMP(3),

    CONSTRAINT "UserCopy_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Statistic" (
    "date" TIMESTAMP(3) NOT NULL,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Statistic_pkey" PRIMARY KEY ("date")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCopy_email_key" ON "UserCopy"("email");
