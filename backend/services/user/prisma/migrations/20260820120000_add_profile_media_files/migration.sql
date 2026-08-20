-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "mime_type" VARCHAR(50),
    "filename" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "user"
ADD COLUMN "low_quality_profile_picture_file_id" TEXT,
ADD COLUMN "best_quality_profile_picture_file_id" TEXT,
ADD COLUMN "low_quality_cover_picture_file_id" TEXT,
ADD COLUMN "best_quality_cover_picture_file_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_low_quality_profile_picture_file_id_key"
ON "user"("low_quality_profile_picture_file_id");

CREATE UNIQUE INDEX "user_best_quality_profile_picture_file_id_key"
ON "user"("best_quality_profile_picture_file_id");

CREATE UNIQUE INDEX "user_low_quality_cover_picture_file_id_key"
ON "user"("low_quality_cover_picture_file_id");

CREATE UNIQUE INDEX "user_best_quality_cover_picture_file_id_key"
ON "user"("best_quality_cover_picture_file_id");

-- AddForeignKey
ALTER TABLE "user"
ADD CONSTRAINT "user_low_quality_profile_picture_file_id_fkey"
FOREIGN KEY ("low_quality_profile_picture_file_id") REFERENCES "file"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user"
ADD CONSTRAINT "user_best_quality_profile_picture_file_id_fkey"
FOREIGN KEY ("best_quality_profile_picture_file_id") REFERENCES "file"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user"
ADD CONSTRAINT "user_low_quality_cover_picture_file_id_fkey"
FOREIGN KEY ("low_quality_cover_picture_file_id") REFERENCES "file"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user"
ADD CONSTRAINT "user_best_quality_cover_picture_file_id_fkey"
FOREIGN KEY ("best_quality_cover_picture_file_id") REFERENCES "file"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
