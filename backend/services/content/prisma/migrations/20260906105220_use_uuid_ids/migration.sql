-- DropIndex
DROP INDEX "post_id_created_at_idx";

-- CreateIndex
CREATE INDEX "post_created_at_id_idx" ON "post"("created_at", "id");
