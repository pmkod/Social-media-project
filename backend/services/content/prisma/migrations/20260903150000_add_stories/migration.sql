-- CreateTable
CREATE TABLE "story" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "media_type" VARCHAR(50) NOT NULL,
    "media_file_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_view" (
    "id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "viewer_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_view_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "story_media_file_id_key" ON "story"("media_file_id");

-- CreateIndex
CREATE INDEX "story_author_id_expires_at_created_at_idx" ON "story"("author_id", "expires_at", "created_at");

-- CreateIndex
CREATE INDEX "story_expires_at_idx" ON "story"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "story_view_story_id_viewer_id_key" ON "story_view"("story_id", "viewer_id");

-- CreateIndex
CREATE INDEX "story_view_viewer_id_viewed_at_idx" ON "story_view"("viewer_id", "viewed_at");

-- AddForeignKey
ALTER TABLE "story" ADD CONSTRAINT "story_media_file_id_fkey" FOREIGN KEY ("media_file_id") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_view" ADD CONSTRAINT "story_view_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
