import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as UserPrismaClient } from "../../../backend/services/user/src/generated/prisma/client";
import { PrismaClient as ContentPrismaClient } from "../../../backend/services/content/src/generated/prisma/client";
import { Config } from "../config";

const createUserPrisma = () => {
  const adapter = new PrismaPg({ connectionString: Config.userDatabaseUrl });
  return new UserPrismaClient({ adapter });
};

const createContentPrisma = () => {
  const adapter = new PrismaPg({ connectionString: Config.contentDatabaseUrl });
  return new ContentPrismaClient({ adapter });
};

let userPrisma: ReturnType<typeof createUserPrisma> | undefined;
let contentPrisma: ReturnType<typeof createContentPrisma> | undefined;

const getUserPrisma = () => {
  if (!userPrisma) userPrisma = createUserPrisma();
  return userPrisma;
};

const getContentPrisma = () => {
  if (!contentPrisma) contentPrisma = createContentPrisma();
  return contentPrisma;
};

const disconnectDatabases = async () => {
  if (userPrisma) {
    await userPrisma.$disconnect();
    userPrisma = undefined;
  }
  if (contentPrisma) {
    await contentPrisma.$disconnect();
    contentPrisma = undefined;
  }
};

const resetDatabases = async () => {
  const user = getUserPrisma();
  const content = getContentPrisma();

  await content.$executeRawUnsafe(
    `TRUNCATE TABLE "bookmark_collection_item", "bookmark_collection", "bookmark", "comment_like", "comment", "post_like", "post_media", "file", "post" RESTART IDENTITY CASCADE;`,
  );

  await user.$executeRawUnsafe(
    `TRUNCATE TABLE "user_verification", "search_history", "follow", "block", "file", "user" RESTART IDENTITY CASCADE;`,
  );
};

export { getUserPrisma, getContentPrisma, disconnectDatabases, resetDatabases };
