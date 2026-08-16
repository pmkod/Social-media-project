CREATE TABLE "bookmark" (
  "id" TEXT NOT NULL,
  "post_id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bookmark_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bookmark_collection" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "name" VARCHAR(60) NOT NULL,
  "description" VARCHAR(280),
  "is_public" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bookmark_collection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bookmark_collection_item" (
  "id" TEXT NOT NULL,
  "collection_id" TEXT NOT NULL,
  "bookmark_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bookmark_collection_item_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bookmark_post_id_owner_id_key"
ON "bookmark"("post_id", "owner_id");

CREATE INDEX "bookmark_owner_id_created_at_idx"
ON "bookmark"("owner_id", "created_at");

CREATE UNIQUE INDEX "bookmark_collection_owner_id_name_key"
ON "bookmark_collection"("owner_id", "name");

CREATE INDEX "bookmark_collection_owner_id_created_at_idx"
ON "bookmark_collection"("owner_id", "created_at");

CREATE UNIQUE INDEX "bookmark_collection_item_collection_id_bookmark_id_key"
ON "bookmark_collection_item"("collection_id", "bookmark_id");

CREATE INDEX "bookmark_collection_item_collection_id_created_at_idx"
ON "bookmark_collection_item"("collection_id", "created_at");

CREATE INDEX "bookmark_collection_item_bookmark_id_idx"
ON "bookmark_collection_item"("bookmark_id");

ALTER TABLE "bookmark"
ADD CONSTRAINT "bookmark_post_id_fkey"
FOREIGN KEY ("post_id") REFERENCES "post"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookmark_collection_item"
ADD CONSTRAINT "bookmark_collection_item_collection_id_fkey"
FOREIGN KEY ("collection_id") REFERENCES "bookmark_collection"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookmark_collection_item"
ADD CONSTRAINT "bookmark_collection_item_bookmark_id_fkey"
FOREIGN KEY ("bookmark_id") REFERENCES "bookmark"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
