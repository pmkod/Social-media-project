import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { PostsRoutesTag } from "../posts.constants";

export interface FeedCursor {
	id: string;
	createdAt: string;
}

const routeDef = createRoute({
	method: "get",
	path: "/feed/following",
	summary: "Get following feed with cursor pagination and counts",
	tags: [PostsRoutesTag],
	request: {
		query: z.object({
			authorId: z.string().optional(),
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("10"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "List of posts from following feed with medias and cursor pagination metadata",
		},
	},
});

const getFeedFollowingRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const query = c.req.valid("query");
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 10, 1),
			50,
		);

		const cursorDate = query.cursorCreatedAt
			? new Date(query.cursorCreatedAt)
			: null;
		const isValidDate =
			cursorDate !== null && !Number.isNaN(cursorDate.getTime());
		const cursorId = query.cursorId;

		const cursorCondition =
			isValidDate && cursorId
				? {
						OR: [
							{
								createdAt: {
									lt: cursorDate,
								},
							},
							{
								createdAt: cursorDate,
								id: {
									lt: cursorId,
								},
							},
						],
					}
				: undefined;

		const where = {
			AND: [
				...(query.authorId ? [{ authorId: query.authorId }] : []),
				...(cursorCondition ? [cursorCondition] : []),
			],
		};

		const posts = await prisma.post.findMany({
			where,
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
					take: 2,
					orderBy: { createdAt: "desc" },
					select: {
						id: true,
						postId: true,
						authorId: true,
						content: true,
						likesCount: true,
						createdAt: true,
						updatedAt: true,
					},
				},
			},
		});

		const hasNextPage = posts.length > limit;
		const items = hasNextPage ? posts.slice(0, limit) : posts;
		const lastItem = items[items.length - 1];

		const nextCursor: FeedCursor | null =
			hasNextPage && lastItem
				? {
						id: lastItem.id,
						createdAt: lastItem.createdAt.toISOString(),
					}
				: null;

		return c.json({
			posts: items,
			pagination: {
				nextCursor,
				hasNextPage,
				limit,
			},
		});
	},
});

export { getFeedFollowingRoute };

