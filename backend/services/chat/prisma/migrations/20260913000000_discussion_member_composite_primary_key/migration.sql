-- Use the discussion and user pair as the membership identity.
ALTER TABLE "discussion_member" DROP CONSTRAINT "discussion_member_pkey";

DROP INDEX "discussion_member_discussion_id_user_id_key";

ALTER TABLE "discussion_member" DROP COLUMN "id";

ALTER TABLE "discussion_member"
ADD CONSTRAINT "discussion_member_pkey" PRIMARY KEY ("discussion_id", "user_id");
