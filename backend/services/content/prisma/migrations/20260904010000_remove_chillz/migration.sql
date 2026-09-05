DROP INDEX "post_author_id_type_created_at_id_idx";
DROP INDEX "post_type_created_at_id_idx";

ALTER TABLE "post" DROP COLUMN "type";

DROP TYPE "PostType";
