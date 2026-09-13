-- Use the collection and bookmark pair as the item identity.
ALTER TABLE "bookmark_collection_item"
DROP CONSTRAINT "bookmark_collection_item_pkey";

DROP INDEX "bookmark_collection_item_collection_id_bookmark_id_key";

ALTER TABLE "bookmark_collection_item" DROP COLUMN "id";

ALTER TABLE "bookmark_collection_item"
ADD CONSTRAINT "bookmark_collection_item_pkey"
PRIMARY KEY ("collection_id", "bookmark_id");
