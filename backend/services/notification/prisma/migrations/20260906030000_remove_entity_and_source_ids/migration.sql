ALTER TABLE "notification"
ADD COLUMN "parent_comment_id" TEXT;

UPDATE "notification"
SET "parent_comment_id" = "entity_id"
WHERE "event_type" = 'COMMENT_REPLY';

DROP INDEX "notification_event_type_source_id_key";
DROP INDEX "notification_recipient_id_event_type_entity_id_created_at_idx";

ALTER TABLE "notification"
DROP COLUMN "entity_id",
DROP COLUMN "source_id";

CREATE INDEX "notification_parent_comment_id_idx"
ON "notification"("parent_comment_id");
