ALTER TABLE "comment"
ADD COLUMN "parent_id" TEXT,
ADD COLUMN "replies_count" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "comment"
ADD CONSTRAINT "comment_parent_id_fkey"
FOREIGN KEY ("parent_id") REFERENCES "comment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "comment_post_id_parent_id_created_at_idx"
ON "comment"("post_id", "parent_id", "created_at");

CREATE INDEX "comment_parent_id_created_at_idx"
ON "comment"("parent_id", "created_at");
