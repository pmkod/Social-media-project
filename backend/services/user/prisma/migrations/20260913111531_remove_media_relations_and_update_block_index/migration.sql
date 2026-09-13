-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_best_quality_cover_picture_file_id_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_best_quality_profile_picture_file_id_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_low_quality_cover_picture_file_id_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_low_quality_profile_picture_file_id_fkey";

-- DropIndex
DROP INDEX "block_blocked_id_created_at_idx";

-- DropIndex
DROP INDEX "user_best_quality_cover_picture_file_id_key";

-- DropIndex
DROP INDEX "user_best_quality_profile_picture_file_id_key";

-- DropIndex
DROP INDEX "user_low_quality_cover_picture_file_id_key";

-- DropIndex
DROP INDEX "user_low_quality_profile_picture_file_id_key";

-- CreateIndex
CREATE INDEX "block_blocked_id_idx" ON "block"("blocked_id");
