ALTER TABLE "discussion"
ADD COLUMN "is_started" BOOLEAN NOT NULL DEFAULT false;

UPDATE "discussion" AS "discussion_to_update"
SET "is_started" = true
WHERE EXISTS (
    SELECT 1
    FROM "message"
    WHERE "message"."discussion_id" = "discussion_to_update"."id"
);
