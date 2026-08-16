ALTER TABLE "user"
ADD COLUMN "cover_url" TEXT,
ADD COLUMN "post_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "followers_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "following_count" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "follow" (
  "id" TEXT NOT NULL,
  "follower_id" TEXT NOT NULL,
  "following_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "follow_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "follow_follower_id_following_id_key"
ON "follow"("follower_id", "following_id");

CREATE INDEX "follow_follower_id_created_at_idx"
ON "follow"("follower_id", "created_at");

CREATE INDEX "follow_following_id_created_at_idx"
ON "follow"("following_id", "created_at");

ALTER TABLE "follow"
ADD CONSTRAINT "follow_follower_id_fkey"
FOREIGN KEY ("follower_id") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "follow"
ADD CONSTRAINT "follow_following_id_fkey"
FOREIGN KEY ("following_id") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
