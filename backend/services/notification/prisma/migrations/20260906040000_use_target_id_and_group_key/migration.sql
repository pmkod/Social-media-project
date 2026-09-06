ALTER TABLE "notification"
ADD COLUMN "target_id" TEXT,
ADD COLUMN "group_key" TEXT;

UPDATE "notification"
SET
  "target_id" = CASE "event_type"
    WHEN 'POST_LIKE' THEN "post_id"
    WHEN 'COMMENT_LIKE' THEN "comment_id"
    WHEN 'POST_COMMENT' THEN "comment_id"
    WHEN 'COMMENT_REPLY' THEN "comment_id"
    ELSE NULL
  END,
  "group_key" = CASE "event_type"
    WHEN 'FOLLOW' THEN 'FOLLOW'
    WHEN 'POST_LIKE' THEN 'POST_LIKE:' || COALESCE("post_id", "id")
    WHEN 'COMMENT_LIKE' THEN 'COMMENT_LIKE:' || COALESCE("comment_id", "id")
    WHEN 'POST_COMMENT' THEN 'POST_COMMENT:' || COALESCE("post_id", "id")
    WHEN 'COMMENT_REPLY' THEN 'COMMENT_REPLY:' || COALESCE("parent_comment_id", "id") || ':' || COALESCE("post_id", "id")
    ELSE "event_type"::text || ':' || "id"
  END;

ALTER TABLE "notification"
ALTER COLUMN "group_key" SET NOT NULL;

DROP INDEX "notification_post_id_idx";
DROP INDEX "notification_comment_id_idx";
DROP INDEX "notification_parent_comment_id_idx";

ALTER TABLE "notification"
DROP COLUMN "post_id",
DROP COLUMN "comment_id",
DROP COLUMN "parent_comment_id";

CREATE INDEX "notification_recipient_id_event_type_group_key_initiator_id_target_id_idx"
ON "notification"("recipient_id", "event_type", "group_key", "initiator_id", "target_id");
CREATE INDEX "notification_target_id_idx" ON "notification"("target_id");
CREATE INDEX "notification_group_key_idx" ON "notification"("group_key");
