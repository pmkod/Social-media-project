CREATE TYPE "DiscussionType" AS ENUM ('PRIVATE', 'GROUP');
CREATE TYPE "DiscussionMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

CREATE TABLE "discussion" (
    "id" TEXT NOT NULL,
    "type" "DiscussionType" NOT NULL,
    "name" VARCHAR(100),
    "description" VARCHAR(500),
    "private_key" VARCHAR(512),
    "created_by_id" TEXT NOT NULL,
    "last_message_id" TEXT,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "discussion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "discussion_member" (
    "id" TEXT NOT NULL,
    "discussion_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "DiscussionMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "discussion_member_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "discussion_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "reply_to_id" TEXT,
    "content" VARCHAR(4000) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "edited_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "discussion_private_key_key" ON "discussion"("private_key");
CREATE UNIQUE INDEX "discussion_last_message_id_key" ON "discussion"("last_message_id");
CREATE INDEX "discussion_last_activity_at_id_idx" ON "discussion"("last_activity_at", "id");
CREATE INDEX "discussion_created_by_id_idx" ON "discussion"("created_by_id");
CREATE UNIQUE INDEX "discussion_member_discussion_id_user_id_key" ON "discussion_member"("discussion_id", "user_id");
CREATE INDEX "discussion_member_user_id_left_at_discussion_id_idx" ON "discussion_member"("user_id", "left_at", "discussion_id");
CREATE INDEX "message_discussion_id_created_at_id_idx" ON "message"("discussion_id", "created_at", "id");
CREATE INDEX "message_sender_id_idx" ON "message"("sender_id");
CREATE INDEX "message_reply_to_id_idx" ON "message"("reply_to_id");

ALTER TABLE "discussion_member" ADD CONSTRAINT "discussion_member_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "message" ADD CONSTRAINT "message_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "message" ADD CONSTRAINT "message_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_last_message_id_fkey" FOREIGN KEY ("last_message_id") REFERENCES "message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
