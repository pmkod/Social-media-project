CREATE TABLE "block" (
  "id" TEXT NOT NULL,
  "blocker_id" TEXT NOT NULL,
  "blocked_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "block_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "block_blocker_id_blocked_id_key"
ON "block"("blocker_id", "blocked_id");

CREATE INDEX "block_blocker_id_created_at_idx"
ON "block"("blocker_id", "created_at");

CREATE INDEX "block_blocked_id_created_at_idx"
ON "block"("blocked_id", "created_at");

ALTER TABLE "block"
ADD CONSTRAINT "block_blocker_id_fkey"
FOREIGN KEY ("blocker_id") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "block"
ADD CONSTRAINT "block_blocked_id_fkey"
FOREIGN KEY ("blocked_id") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
