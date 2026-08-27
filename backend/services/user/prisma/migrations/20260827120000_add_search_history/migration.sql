-- CreateTable
CREATE TABLE "search_history" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "text" VARCHAR(255),
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "search_history_has_target" CHECK (
        ("text" IS NOT NULL AND "user_id" IS NULL)
        OR ("text" IS NULL AND "user_id" IS NOT NULL)
    )
);

-- CreateIndex
CREATE INDEX "search_history_owner_id_created_at_id_idx" ON "search_history"("owner_id", "created_at", "id");

-- CreateIndex
CREATE INDEX "search_history_user_id_idx" ON "search_history"("user_id");

-- AddForeignKey
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
