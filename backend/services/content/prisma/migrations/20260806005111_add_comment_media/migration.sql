-- CreateTable
CREATE TABLE "comment_media" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 1,
    "media_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "low_quality_file_id" TEXT,
    "high_quality_file_id" TEXT,

    CONSTRAINT "comment_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comment_media_low_quality_file_id_key" ON "comment_media"("low_quality_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "comment_media_high_quality_file_id_key" ON "comment_media"("high_quality_file_id");

-- AddForeignKey
ALTER TABLE "comment_media" ADD CONSTRAINT "comment_media_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_media" ADD CONSTRAINT "comment_media_low_quality_file_id_fkey" FOREIGN KEY ("low_quality_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_media" ADD CONSTRAINT "comment_media_high_quality_file_id_fkey" FOREIGN KEY ("high_quality_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
