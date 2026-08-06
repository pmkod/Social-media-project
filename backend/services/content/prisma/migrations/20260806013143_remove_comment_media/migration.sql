/*
  Warnings:

  - You are about to drop the `comment_media` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "comment_media" DROP CONSTRAINT "comment_media_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "comment_media" DROP CONSTRAINT "comment_media_high_quality_file_id_fkey";

-- DropForeignKey
ALTER TABLE "comment_media" DROP CONSTRAINT "comment_media_low_quality_file_id_fkey";

-- DropTable
DROP TABLE "comment_media";
