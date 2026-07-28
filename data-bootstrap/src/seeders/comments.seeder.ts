import { Config } from "../config";
import { generateCommentContent } from "../lib/faker";
import { deterministicInt, hashString, pickByIndex } from "../lib/static-data";
import { getContentPrisma } from "../lib/database";
import { logger } from "../lib/logger";
import { createCommentViaApi } from "../lib/api";
import type { SeededPost } from "./posts.seeder";
import type { SeededUser } from "./users.seeder";

export type SeededComment = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
};

let globalCommentIndex = 0;

const seedComments = async (users: SeededUser[], posts: SeededPost[]): Promise<SeededComment[]> => {
  const prisma = getContentPrisma();
  const existingCommentCount = await prisma.comment.count();
  if (existingCommentCount > 0) {
    logger.warn(`Comment table already contains ${existingCommentCount} rows. Skipping comment seeding.`);
    return prisma.comment.findMany({
      select: { id: true, postId: true, authorId: true, content: true },
    });
  }

  logger.info(`Seeding comments (${Config.seedCommentsPerPost} per post)...`);

  const comments: SeededComment[] = [];

  for (const post of posts) {
    const commentCount = deterministicInt(
      globalCommentIndex + hashString(post.id),
      Math.max(0, Config.seedCommentsPerPost - 1),
      Config.seedCommentsPerPost + 2,
    );

    for (let i = 0; i < commentCount; i++) {
      const authorIndex = (globalCommentIndex + i) % Math.max(1, users.length);
      const author = pickByIndex(users, authorIndex);
      const content = generateCommentContent(globalCommentIndex++);

      if (Config.useApi) {
        const comment = await createCommentViaApi(author.id, post.id, { content });
        comments.push({ id: comment.id, postId: post.id, authorId: author.id, content });
        logger.success(`Created comment via API: ${comment.id} on post ${post.id}`);
        continue;
      }

      const comment = await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: author.id,
          content,
        },
        select: {
          id: true,
          postId: true,
          authorId: true,
          content: true,
        },
      });

      comments.push(comment);
      logger.success(`Created comment: ${comment.id} on post ${post.id}`);
    }
  }

  logger.success(`Seeded ${comments.length} comments.`);
  return comments;
};

export { seedComments };
