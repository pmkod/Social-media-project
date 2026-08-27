ALTER TABLE "comment"
ADD COLUMN "deleted_at" TIMESTAMP(3);

CREATE INDEX "comment_deleted_at_idx" ON "comment"("deleted_at");
