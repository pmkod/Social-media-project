ALTER TABLE "notification"
ADD COLUMN "target_user_id" TEXT,
ADD COLUMN "parent_comment_id" TEXT;

UPDATE "notification"
SET "target_user_id" = "entity_id"
WHERE "event_type" = 'FOLLOW';

UPDATE "notification"
SET "parent_comment_id" = "entity_id"
WHERE "event_type" = 'COMMENT_REPLY';

DROP INDEX "notification_recipient_id_event_type_entity_id_created_at_idx";

ALTER TABLE "notification" DROP COLUMN "entity_id";

CREATE INDEX "notification_parent_comment_id_idx"
ON "notification"("parent_comment_id");
