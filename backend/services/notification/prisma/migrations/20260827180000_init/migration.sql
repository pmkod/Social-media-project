CREATE TYPE "NotificationEventType" AS ENUM ('FOLLOW', 'POST_LIKE', 'POST_COMMENT', 'COMMENT_REPLY');

CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "event_type" "NotificationEventType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "post_id" TEXT,
    "comment_id" TEXT,
    "content_preview" VARCHAR(280),
    "is_seen" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notification_event_type_source_id_key" ON "notification"("event_type", "source_id");
CREATE INDEX "notification_recipient_id_created_at_id_idx" ON "notification"("recipient_id", "created_at", "id");
CREATE INDEX "notification_recipient_id_is_seen_idx" ON "notification"("recipient_id", "is_seen");
CREATE INDEX "notification_recipient_id_event_type_entity_id_created_at_idx" ON "notification"("recipient_id", "event_type", "entity_id", "created_at");
CREATE INDEX "notification_post_id_idx" ON "notification"("post_id");
CREATE INDEX "notification_comment_id_idx" ON "notification"("comment_id");
