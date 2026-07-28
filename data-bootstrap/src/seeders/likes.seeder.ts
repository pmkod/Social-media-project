import { Config } from "../config";
import { pickLikers } from "../lib/faker";
import { getContentPrisma } from "../lib/database";
import { logger } from "../lib/logger";
import { likePostViaApi, likeCommentViaApi } from "../lib/api";
import type { SeededPost } from "./posts.seeder";
import type { SeededComment } from "./comments.seeder";
import type { SeededUser } from "./users.seeder";

const seedLikes = async (
  users: SeededUser[],
  posts: SeededPost[],
  comments: SeededComment[],
): Promise<{ postLikes: number; commentLikes: number }> => {
  const prisma = getContentPrisma();

  const existingPostLikeCount = await prisma.postLike.count();
  const existingCommentLikeCount = await prisma.commentLike.count();
  if (existingPostLikeCount > 0 || existingCommentLikeCount > 0) {
    logger.warn(`Like tables already contain data. Skipping like seeding.`);
    return { postLikes: existingPostLikeCount, commentLikes: existingCommentLikeCount };
  }

  logger.info("Seeding likes...");

  let postLikes = 0;
  let commentLikes = 0;

  for (const post of posts) {
    const likers = pickLikers(users, post.authorId, `post-${post.id}`, Config.seedLikeProbability);
    for (const user of likers) {
      if (user.id === post.authorId) continue;

      if (Config.useApi) {
        await likePostViaApi(user.id, post.id);
        postLikes++;
        continue;
      }

      await prisma.postLike.create({
        data: {
          postId: post.id,
          authorId: user.id,
        },
      });
      postLikes++;
      logger.success(`User ${user.username} liked post ${post.id}`);
    }
  }

  for (const comment of comments) {
    const likers = pickLikers(users, comment.authorId, `comment-${comment.id}`, Config.seedLikeProbability);
    for (const user of likers) {
      if (user.id === comment.authorId) continue;

      if (Config.useApi) {
        await likeCommentViaApi(user.id, comment.id);
        commentLikes++;
        continue;
      }

      await prisma.commentLike.create({
        data: {
          commentId: comment.id,
          authorId: user.id,
        },
      });
      commentLikes++;
      logger.success(`User ${user.username} liked comment ${comment.id}`);
    }
  }

  logger.success(`Seeded ${postLikes} post likes and ${commentLikes} comment likes.`);
  return { postLikes, commentLikes };
};

export { seedLikes };
