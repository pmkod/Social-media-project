import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { Prisma } from "@/generated/prisma/client";

type PostListCursor = {
	id: string;
	createdAt: string;
};

type GetPostListInput = {
	where?: Prisma.PostWhereInput;
	cursorId?: string;
	cursorCreatedAt?: string;
	limit: number;
	authenticatedUserId?: string;
	visibilityOwnerId?: string;
};

const getPostList = async ({
	where,
	cursorId,
	cursorCreatedAt,
	limit,
	authenticatedUserId,
	visibilityOwnerId,
}: GetPostListInput) => {
	const blockRelationships = authenticatedUserId
		? await userServiceClient.fetchBlockRelationshipIds(authenticatedUserId)
		: { blockedUserIds: [], blockedByUserIds: [] };
	const hiddenUserIds = Array.from(
		new Set([
			...blockRelationships.blockedUserIds,
			...blockRelationships.blockedByUserIds,
		]),
	);
	if (visibilityOwnerId && hiddenUserIds.includes(visibilityOwnerId)) {
		return {
			posts: [],
			pagination: { nextCursor: null, hasNextPage: false, limit },
		};
	}
	const cursorDate = cursorCreatedAt ? new Date(cursorCreatedAt) : null;
	const hasValidCursor =
		cursorDate !== null && !Number.isNaN(cursorDate.getTime()) && cursorId;
	const cursorCondition: Prisma.PostWhereInput | undefined = hasValidCursor
		? {
				OR: [
					{ createdAt: { lt: cursorDate } },
					{ createdAt: cursorDate, id: { lt: cursorId } },
				],
			}
		: undefined;

	const blockCondition: Prisma.PostWhereInput | undefined =
		hiddenUserIds.length > 0
			? { authorId: { notIn: hiddenUserIds } }
			: undefined;
	const filters = [where, cursorCondition, blockCondition].filter(
		(filter): filter is Prisma.PostWhereInput => Boolean(filter),
	);

	const posts = await prisma.post.findMany({
		where: filters.length > 0 ? { AND: filters } : undefined,
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		take: limit + 1,
		select: {
			id: true,
			authorId: true,
			text: true,
			likesCount: true,
			commentsCount: true,
			createdAt: true,
			updatedAt: true,
			medias: {
				select: {
					id: true,
					postId: true,
					position: true,
					mediaType: true,
					createdAt: true,
					lowQualityFileId: true,
					lowQualityFile: {
						select: {
							id: true,
							mimeType: true,
							filename: true,
							createdAt: true,
						},
					},
					highQualityFileId: true,
					highQualityFile: {
						select: {
							id: true,
							mimeType: true,
							filename: true,
							createdAt: true,
						},
					},
				},
				orderBy: { position: "asc" },
			},
			comments: {
				where: {
					parentId: null,
					...(hiddenUserIds.length > 0
						? { authorId: { notIn: hiddenUserIds } }
						: {}),
				},
				take: 2,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					postId: true,
					authorId: true,
					parentId: true,
					content: true,
					likesCount: true,
					repliesCount: true,
					createdAt: true,
					updatedAt: true,
				},
			},
		},
	});

	const hasNextPage = posts.length > limit;
	const items = hasNextPage ? posts.slice(0, limit) : posts;
	const lastItem = items.at(-1);
	const nextCursor: PostListCursor | null =
		hasNextPage && lastItem
			? { id: lastItem.id, createdAt: lastItem.createdAt.toISOString() }
			: null;
	const postIds = items.map((post) => post.id);
	const authorIds = Array.from(
		new Set([
			...items.map((post) => post.authorId),
			...items.flatMap((post) =>
				post.comments.map((comment) => comment.authorId),
			),
		]),
	);

	const [authorsMap, likedPostIds, bookmarkedPostIds] = await Promise.all([
		userServiceClient.fetchAuthorsBatch(authorIds, authenticatedUserId),
		(async () => {
			if (!authenticatedUserId || postIds.length === 0) {
				return new Set<string>();
			}
			const likes = await prisma.postLike.findMany({
				where: { authorId: authenticatedUserId, postId: { in: postIds } },
				select: { postId: true },
			});
			return new Set(likes.map((like) => like.postId));
		})(),
		(async () => {
			if (!authenticatedUserId || postIds.length === 0) {
				return new Set<string>();
			}
			const bookmarks = await prisma.bookmark.findMany({
				where: { ownerId: authenticatedUserId, postId: { in: postIds } },
				select: { postId: true },
			});
			return new Set(bookmarks.map((bookmark) => bookmark.postId));
		})(),
	]);

	return {
		posts: items.map((post) => ({
			...post,
			isLikedByAuthenticatedUser: likedPostIds.has(post.id),
			isBookmarkedByAuthenticatedUser: bookmarkedPostIds.has(post.id),
			author: authorsMap.get(post.authorId) ?? null,
			comments: post.comments.map((comment) => ({
				...comment,
				author: authorsMap.get(comment.authorId) ?? null,
			})),
		})),
		pagination: { nextCursor, hasNextPage, limit },
	};
};

export { getPostList };
export type { PostListCursor };
