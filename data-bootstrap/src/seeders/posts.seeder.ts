import { Config } from "../config";
import { generatePostContent } from "../lib/faker";
import { deterministicInt } from "../lib/static-data";
import { generateMedia } from "../lib/files";
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

const createSinglePost = async (user: SeededUser, index: number): Promise<SeededPost> => {
  const contentIndex = globalPostIndex++;
  const content = generatePostContent(contentIndex);
  const mediaCount = deterministicInt(contentIndex, 0, 3);

  if (Config.useApi) {
    const mediaUrls: string[] = [];
    for (let m = 0; m < mediaCount; m++) {
      // Stable placeholder id to keep generated filenames deterministic when using the API.
      const mediaUrl = await generateMedia(`api-${user.id}-${index}-${m}`, m);
      mediaUrls.push(mediaUrl);
    }
    const post = await createPostViaApi(user.id, { text: content, mediaUrls });
    logger.success(`Created post via API: ${post.id} by ${user.username}`);
    return { id: post.id, authorId: user.id, content };
  }

  const prisma = getContentPrisma();
  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      content,
      mediaUrls: [],
    },
    select: {
      id: true,
      authorId: true,
      content: true,
    },
  });

  const finalMediaUrls: string[] = [];
  for (let m = 0; m < mediaCount; m++) {
    finalMediaUrls.push(await generateMedia(post.id, m));
  }

  if (finalMediaUrls.length > 0) {
    await prisma.post.update({
      where: { id: post.id },
      data: { mediaUrls: finalMediaUrls },
    });
  }

  logger.success(`Created post: ${post.id} by ${user.username}`);
  return post;
};

const seedPosts = async (users: SeededUser[]): Promise<SeededPost[]> => {
  const prisma = getContentPrisma();
  const existingPostCount = await prisma.post.count();
  if (existingPostCount > 0) {
    logger.warn(`Post table already contains ${existingPostCount} rows. Skipping post seeding.`);
    return prisma.post.findMany({ select: { id: true, authorId: true, content: true } });
  }

  logger.info(`Seeding posts (${Config.seedPostsPerUser} per user)...`);

  const posts: SeededPost[] = [];
  for (const user of users) {
    for (let i = 0; i < Config.seedPostsPerUser; i++) {
      const post = await createSinglePost(user, i);
      posts.push(post);
    }
  }

  logger.success(`Seeded ${posts.length} posts.`);
  return posts;
};

export { seedPosts };
