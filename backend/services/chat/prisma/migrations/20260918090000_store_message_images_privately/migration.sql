-- Message images are now stored in a private S3 bucket. Only object keys are
-- persisted; the API exposes authenticated routes instead of public S3 URLs.
ALTER TABLE "message_media"
ALTER COLUMN "url" DROP NOT NULL,
ADD COLUMN "position" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "low_quality_file_name" VARCHAR(255),
ADD COLUMN "high_quality_file_name" VARCHAR(255);
