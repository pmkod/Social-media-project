-- Keep soft-delete states explicit and affirmative on each membership.
ALTER TABLE "discussion_member"
ADD COLUMN "has_left" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "is_blocked" BOOLEAN NOT NULL DEFAULT false;

UPDATE "discussion_member"
SET "has_left" = true
WHERE "left_at" IS NOT NULL;

DROP INDEX "discussion_member_user_id_left_at_discussion_id_idx";

ALTER TABLE "discussion_member"
DROP COLUMN "left_at";

CREATE INDEX "discussion_member_user_id_has_left_is_deleted_discussion_id_idx"
ON "discussion_member"("user_id", "has_left", "is_deleted", "discussion_id");

-- A media-only message has no textual content.
ALTER TABLE "message"
ALTER COLUMN "content" DROP NOT NULL;

CREATE TYPE "MessageMediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'FILE');

CREATE TABLE "message_media" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "type" "MessageMediaType" NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "file_name" VARCHAR(255),
    "mime_type" VARCHAR(127),
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_media_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "message_media_message_id_idx" ON "message_media"("message_id");
CREATE INDEX "message_media_created_at_id_idx" ON "message_media"("created_at", "id");

ALTER TABLE "message_media"
ADD CONSTRAINT "message_media_message_id_fkey"
FOREIGN KEY ("message_id") REFERENCES "message"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
