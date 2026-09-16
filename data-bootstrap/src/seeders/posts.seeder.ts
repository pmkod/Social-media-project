import { Config } from "../config";
import { generatePostContent } from "../lib/faker";
import { getContentPrisma } from "../lib/database";
import { logger } from "../lib/logger";
import { createPostViaApi } from "../lib/api";
import type { SeededUser } from "./users.seeder";

export type SeededPost = {
  id: string;
  authorId: string;
  content: string;
};

let globalPostIndex = 0;

const createSinglePost = async (user: SeededUser): Promise<SeededPost> => {
  const contentIndex = globalPostIndex++;
  const content = generatePostContent(contentIndex);

  if (Config.useApi) {
    const post = await createPostViaApi(user.id, { text: content });
    logger.success(`Created post via API: ${post.id} by ${user.username}`);
    return { id: post.id, authorId: user.id, content };
  }

  const prisma = getContentPrisma();
  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      text: content,
    },
    select: {
      id: true,
      authorId: true,
      text: true,
    },
  });

  logger.success(`Created post: ${post.id} by ${user.username}`);
  return { id: post.id, authorId: post.authorId, content: post.text };
};

const seedPosts = async (users: SeededUser[]): Promise<SeededPost[]> => {
  const prisma = getContentPrisma();
  const existingPostCount = await prisma.post.count({ where: { exists: true } });
  if (existingPostCount > 0) {
    logger.warn(`Post table already contains ${existingPostCount} rows. Skipping post seeding.`);
    const posts = await prisma.post.findMany({
      where: { exists: true },
      select: { id: true, authorId: true, text: true },
    });
    return posts.map((post) => ({
      id: post.id,
      authorId: post.authorId,
      content: post.text,
    }));
  }

  logger.info(`Seeding posts (${Config.seedPostsPerUser} per user)...`);

  const posts: SeededPost[] = [];
  for (const user of users) {
    for (let i = 0; i < Config.seedPostsPerUser; i++) {
      const post = await createSinglePost(user);
      posts.push(post);
    }
  }

  logger.success(`Seeded ${posts.length} posts.`);
  return posts;
};

export { seedPosts };
