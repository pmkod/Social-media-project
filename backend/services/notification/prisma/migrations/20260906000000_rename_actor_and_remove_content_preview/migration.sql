ALTER TABLE "notification" RENAME COLUMN "actor_id" TO "initiator_id";
ALTER TABLE "notification" DROP COLUMN "content_preview";
