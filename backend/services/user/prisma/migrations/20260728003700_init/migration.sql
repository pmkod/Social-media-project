-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT,
    "display_name" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "location" TEXT,
    "website" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_token" (
    "id" TEXT NOT NULL,
    "token" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT,
    "disabled_at" TIMESTAMP(3),
    "ip" TEXT,
    "agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_verification" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "full_name" TEXT,
    "password" TEXT,
    "goal" TEXT,
    "verified_at" TIMESTAMP(3),
    "goal_achieved_at" TIMESTAMP(3),
    "disabled_at" TIMESTAMP(3),
    "code" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "number_of_failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "number_of_code_transfers_via_email" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT,
    "ip" TEXT,
    "agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_key" ON "refresh_token"("token");

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_verification" ADD CONSTRAINT "user_verification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
