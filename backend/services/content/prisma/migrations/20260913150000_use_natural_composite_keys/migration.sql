ALTER TABLE "post_like"
DROP CONSTRAINT "post_like_pkey";

ALTER TABLE "post_like"
DROP COLUMN "id";

ALTER TABLE "post_like"
ADD CONSTRAINT "post_like_pkey"
PRIMARY KEY USING INDEX "post_like_post_id_author_id_key";

ALTER TABLE "comment_like"
DROP CONSTRAINT "comment_like_pkey";

ALTER TABLE "comment_like"
DROP COLUMN "id";

ALTER TABLE "comment_like"
ADD CONSTRAINT "comment_like_pkey"
PRIMARY KEY USING INDEX "comment_like_comment_id_author_id_key";

ALTER TABLE "bookmark_collection_item"
ADD COLUMN "post_id" TEXT,
ADD COLUMN "owner_id" TEXT;

UPDATE "bookmark_collection_item" AS "item"
SET
  "post_id" = "bookmark"."post_id",
  "owner_id" = "bookmark"."owner_id"
FROM "bookmark"
WHERE "item"."bookmark_id" = "bookmark"."id";

ALTER TABLE "bookmark_collection_item"
ALTER COLUMN "post_id" SET NOT NULL,
ALTER COLUMN "owner_id" SET NOT NULL;

ALTER TABLE "bookmark_collection_item"
DROP CONSTRAINT "bookmark_collection_item_bookmark_id_fkey";

ALTER TABLE "bookmark_collection_item"
DROP CONSTRAINT "bookmark_collection_item_pkey";

DROP INDEX "bookmark_collection_item_collection_id_created_at_idx";

DROP INDEX "bookmark_collection_item_bookmark_id_idx";

ALTER TABLE "bookmark_collection_item"
DROP COLUMN "bookmark_id";

ALTER TABLE "bookmark"
DROP CONSTRAINT "bookmark_pkey";

ALTER TABLE "bookmark"
DROP COLUMN "id";

ALTER TABLE "bookmark"
ADD CONSTRAINT "bookmark_pkey"
PRIMARY KEY USING INDEX "bookmark_post_id_owner_id_key";

DROP INDEX "bookmark_owner_id_created_at_idx";

CREATE INDEX "bookmark_owner_id_created_at_post_id_idx"
ON "bookmark"("owner_id", "created_at", "post_id");

ALTER TABLE "bookmark_collection_item"
ADD CONSTRAINT "bookmark_collection_item_pkey"
PRIMARY KEY ("collection_id", "post_id", "owner_id");

CREATE INDEX "bookmark_collection_item_collection_id_created_at_post_id_idx"
ON "bookmark_collection_item"("collection_id", "created_at", "post_id");

CREATE INDEX "bookmark_collection_item_post_id_owner_id_idx"
ON "bookmark_collection_item"("post_id", "owner_id");

ALTER TABLE "bookmark_collection_item"
ADD CONSTRAINT "bookmark_collection_item_post_id_owner_id_fkey"
FOREIGN KEY ("post_id", "owner_id")
REFERENCES "bookmark"("post_id", "owner_id")
ON DELETE CASCADE ON UPDATE CASCADE;
