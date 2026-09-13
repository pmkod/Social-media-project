-- DropForeignKey
ALTER TABLE "post_media" DROP CONSTRAINT "post_media_high_quality_file_id_fkey";

-- DropForeignKey
ALTER TABLE "post_media" DROP CONSTRAINT "post_media_low_quality_file_id_fkey";

-- DropIndex
DROP INDEX "bookmark_collection_owner_id_name_key";

-- DropIndex
DROP INDEX "post_media_high_quality_file_id_key";

-- DropIndex
DROP INDEX "post_media_low_quality_file_id_key";
