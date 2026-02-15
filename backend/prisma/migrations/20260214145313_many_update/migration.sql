-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "child_comment_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "exists" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "like_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parent_comment_id" TEXT,
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "comment_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "exists" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "like_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "follow_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "follower_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "post_count" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
