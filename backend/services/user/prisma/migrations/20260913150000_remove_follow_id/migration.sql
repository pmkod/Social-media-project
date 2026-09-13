ALTER TABLE "follow"
DROP CONSTRAINT "follow_pkey";

ALTER TABLE "follow"
DROP COLUMN "id";

ALTER TABLE "follow"
ADD CONSTRAINT "follow_pkey" PRIMARY KEY ("follower_id", "following_id");

DROP INDEX "follow_follower_id_following_id_key";

DROP INDEX "follow_follower_id_created_at_idx";

DROP INDEX "follow_following_id_created_at_idx";

CREATE INDEX "follow_follower_id_created_at_following_id_idx"
ON "follow"("follower_id", "created_at", "following_id");

CREATE INDEX "follow_following_id_created_at_follower_id_idx"
ON "follow"("following_id", "created_at", "follower_id");
