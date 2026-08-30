ALTER TABLE "discussion"
RENAME COLUMN "created_by_id" TO "creator_id";

ALTER INDEX "discussion_created_by_id_idx"
RENAME TO "discussion_creator_id_idx";
