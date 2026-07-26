-- CreateTable
CREATE TABLE "user_verification" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "email" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(255),
    "passwordHash" VARCHAR(255),
    "code" VARCHAR(10) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "goal" VARCHAR(50) NOT NULL,
    "numberOfFailedAttempts" INTEGER NOT NULL DEFAULT 0,
    "numberOfCodeTransfersViaEmail" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMPTZ(6),
    "disabledAt" TIMESTAMPTZ(6),
    "goalAchievedAt" TIMESTAMPTZ(6),

    CONSTRAINT "user_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_token" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMPTZ(6),

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);
