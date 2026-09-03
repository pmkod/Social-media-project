CREATE TYPE "PostType" AS ENUM ('POST', 'SPARK');

ALTER TABLE "post" ADD COLUMN "type" "PostType" NOT NULL DEFAULT 'POST';

CREATE INDEX "post_type_created_at_id_idx" ON "post"("type", "created_at", "id");
CREATE INDEX "post_author_id_type_created_at_id_idx" ON "post"("author_id", "type", "created_at", "id");
