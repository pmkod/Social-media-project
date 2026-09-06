ALTER TABLE "notification" ADD COLUMN "entity_id" TEXT;

UPDATE "notification"
SET "entity_id" = CASE "event_type"
  WHEN 'FOLLOW' THEN "target_user_id"
  WHEN 'POST_LIKE' THEN "post_id"
  WHEN 'COMMENT_LIKE' THEN "comment_id"
  WHEN 'POST_COMMENT' THEN "post_id"
  WHEN 'COMMENT_REPLY' THEN "parent_comment_id"
END;

ALTER TABLE "notification"
ALTER COLUMN "entity_id" SET NOT NULL;

DROP INDEX "notification_parent_comment_id_idx";

ALTER TABLE "notification"
DROP COLUMN "target_user_id",
DROP COLUMN "parent_comment_id";

CREATE INDEX "notification_recipient_id_event_type_entity_id_created_at_idx"
ON "notification"("recipient_id", "event_type", "entity_id", "created_at");
