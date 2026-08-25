-- Replace the polymorphic target pair with explicit nullable target columns.
ALTER TABLE "report"
ADD COLUMN "post_id" TEXT,
ADD COLUMN "comment_id" TEXT,
ADD COLUMN "user_id" TEXT;

UPDATE "report"
SET
    "post_id" = CASE WHEN "target_type" = 'post' THEN "target_id" END,
    "comment_id" = CASE WHEN "target_type" = 'comment' THEN "target_id" END,
    "user_id" = CASE WHEN "target_type" = 'user' THEN "target_id" END;

DROP INDEX "report_reporter_id_created_at_idx";
DROP INDEX "report_status_created_at_idx";
DROP INDEX "report_target_type_target_id_idx";

ALTER TABLE "report"
ALTER COLUMN "reason_id" DROP NOT NULL,
DROP COLUMN "target_type",
DROP COLUMN "target_id";

DROP TYPE "ReportTargetType";

-- Every report must point to one and only one kind of target.
ALTER TABLE "report"
ADD CONSTRAINT "report_exactly_one_target_check"
CHECK (num_nonnulls("post_id", "comment_id", "user_id") = 1);

CREATE INDEX "report_created_at_idx" ON "report"("created_at");
