ALTER TABLE "message" RENAME COLUMN "reply_to_id" TO "parent_message_id";

ALTER INDEX "message_reply_to_id_idx" RENAME TO "message_parent_message_id_idx";

ALTER TABLE "message" RENAME CONSTRAINT "message_reply_to_id_fkey" TO "message_parent_message_id_fkey";
