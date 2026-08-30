ALTER TABLE "report"
ADD COLUMN "discussion_id" TEXT;

ALTER TABLE "report"
DROP CONSTRAINT "report_exactly_one_target_check";

ALTER TABLE "report"
ADD CONSTRAINT "report_exactly_one_target_check"
CHECK (num_nonnulls("post_id", "comment_id", "user_id", "discussion_id") = 1);

CREATE INDEX "report_discussion_id_idx" ON "report"("discussion_id");
