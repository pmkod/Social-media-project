-- AddForeignKey
ALTER TABLE "user"
ADD CONSTRAINT "user_low_quality_profile_picture_file_id_fkey"
FOREIGN KEY ("low_quality_profile_picture_file_id") REFERENCES "file"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"
ADD CONSTRAINT "user_best_quality_profile_picture_file_id_fkey"
FOREIGN KEY ("best_quality_profile_picture_file_id") REFERENCES "file"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"
ADD CONSTRAINT "user_low_quality_cover_picture_file_id_fkey"
FOREIGN KEY ("low_quality_cover_picture_file_id") REFERENCES "file"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user"
ADD CONSTRAINT "user_best_quality_cover_picture_file_id_fkey"
FOREIGN KEY ("best_quality_cover_picture_file_id") REFERENCES "file"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
