ALTER TABLE "block"
DROP CONSTRAINT "block_pkey";

ALTER TABLE "block"
DROP COLUMN "id";

ALTER TABLE "block"
ADD CONSTRAINT "block_pkey"
PRIMARY KEY USING INDEX "block_blocker_id_blocked_id_key";

DROP INDEX "block_blocker_id_created_at_idx";

CREATE INDEX "block_blocker_id_created_at_blocked_id_idx"
ON "block"("blocker_id", "created_at", "blocked_id");
