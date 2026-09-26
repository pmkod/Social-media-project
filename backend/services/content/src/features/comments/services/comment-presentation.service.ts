import { prisma } from "@/core/databases";
import { uniqueValues } from "@/core/functions/collection.functions";
import { userServiceClient } from "@/core/service-clients/user-service.client";
import type { Prisma } from "@/generated/prisma/client";

const commentPresentationSelect = {
	id: true,
	postId: true,
	authorId: true,
	parentId: true,
	content: true,
	likesCount: true,
	repliesCount: true,
	exists: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.CommentSelect;

type CommentPresentationRecord = Prisma.CommentGetPayload<{
	select: typeof commentPresentationSelect;
}>;

async function hydrateComments(
	comments: CommentPresentationRecord[],
	authenticatedUserId?: string,
) {
	const authorIds = uniqueValues(comments.map((comment) => comment.authorId));
	const [authorsMap, likedComments] = await Promise.all([
		userServiceClient.fetchAuthorsBatch(authorIds, authenticatedUserId),
		authenticatedUserId && comments.length > 0
			? prisma.commentLike.findMany({
					where: {
						authorId: authenticatedUserId,
						commentId: { in: comments.map((comment) => comment.id) },
					},
					select: { commentId: true },
				})
			: Promise.resolve([]),
	]);
	const likedCommentIds = new Set(
		likedComments.map((like) => like.commentId),
	);

	return comments.map((comment) => {
		const isDeleted = !comment.exists;
		return {
			...comment,
			content: isDeleted ? "" : comment.content,
			isDeleted,
			isLikedByAuthenticatedUser:
				!isDeleted && likedCommentIds.has(comment.id),
			author: authorsMap.get(comment.authorId) ?? null,
		};
	});
}

export {
	commentPresentationSelect,
	hydrateComments,
	type CommentPresentationRecord,
};
