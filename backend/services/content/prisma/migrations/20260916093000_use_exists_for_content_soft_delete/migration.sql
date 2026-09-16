ALTER TABLE "post"
ADD COLUMN "exists" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "comment"
ADD COLUMN "exists" BOOLEAN NOT NULL DEFAULT true;

UPDATE "comment"
SET "exists" = false
WHERE "deleted_at" IS NOT NULL;

ALTER TABLE "comment"
DROP COLUMN "deleted_at";

CREATE INDEX "post_exists_created_at_id_idx"
ON "post"("exists", "created_at", "id");
