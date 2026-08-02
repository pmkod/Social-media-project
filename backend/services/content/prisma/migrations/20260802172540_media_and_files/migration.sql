/*
  Warnings:

  - You are about to drop the column `media_urls` on the `post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "post" DROP COLUMN "media_urls";

-- CreateTable
CREATE TABLE "post_media" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 1,
    "media_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "low_quality_file_id" TEXT,
    "high_quality_file_id" TEXT,

    CONSTRAINT "post_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "mime_type" VARCHAR(50),
    "filename" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_media_low_quality_file_id_key" ON "post_media"("low_quality_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_media_high_quality_file_id_key" ON "post_media"("high_quality_file_id");

-- AddForeignKey
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_low_quality_file_id_fkey" FOREIGN KEY ("low_quality_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_high_quality_file_id_fkey" FOREIGN KEY ("high_quality_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
