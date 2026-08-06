-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "likes_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "comments_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "likes_count" INTEGER NOT NULL DEFAULT 0;

-- Backfill counts from existing data
UPDATE "comment" AS c
SET "likes_count" = sub.count
FROM (SELECT "comment_id", COUNT(*) AS count FROM "comment_like" GROUP BY "comment_id") AS sub
WHERE c."id" = sub."comment_id";

UPDATE "post" AS p
SET "likes_count" = COALESCE(sub.likes, p."likes_count"),
    "comments_count" = COALESCE(sub.comments, p."comments_count")
FROM (
	SELECT
		COALESCE(l."post_id", c."post_id") AS "post_id",
		l.count AS likes,
		c.count AS comments
	FROM (SELECT "post_id", COUNT(*) AS count FROM "post_like" GROUP BY "post_id") AS l
	FULL OUTER JOIN (SELECT "post_id", COUNT(*) AS count FROM "comment" GROUP BY "post_id") AS c
		ON l."post_id" = c."post_id"
) AS sub
WHERE p."id" = sub."post_id";
