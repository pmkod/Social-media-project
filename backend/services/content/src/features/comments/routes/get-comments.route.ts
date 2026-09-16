import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoEnv } from "@/core/types/hono-env";
import { CommentsRoutesTag } from "../comments.constants";
import {
	commentPresentationSelect,
	hydrateComments,
} from "../services/comment-presentation.service";

const routeDef = createRoute({
	method: "get",
	path: "/comments",
	summary: "Get comments or replies for a post",
	tags: [CommentsRoutesTag],
	request: {
		query: z.object({
			postId: z.string(),
			parentCommentId: z.string().optional(),
			page: z.string().optional().default("1"),
			limit: z.string().optional().default("7"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "List of comments with authors",
		},
	},
});

const getCommentsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoEnv
>({
	route: routeDef,
	handler: async (c) => {
		const query = c.req.valid("query");
		const { postId, parentCommentId } = query;
		const page = Number.parseInt(query.page, 10) || 1;
		const limit = Number.parseInt(query.limit, 10) || 20;
		const skip = (page - 1) * limit;
		const authenticatedUser = c.get("authenticatedUser");
		const authenticatedUserId = authenticatedUser?.id;
		const post = await prisma.post.findFirst({
			where: { id: postId, exists: true },
			select: { authorId: true },
		});
		if (
			!post ||
			(authenticatedUserId &&
				(await userServiceClient.hasBlockRelationship(
					authenticatedUserId,
					post.authorId,
				)))
		) {
			return c.json({
				data: [],
				pagination: { total: 0, page, limit, totalPages: 0 },
			});
		}

		const commentsWhere = {
			postId,
			parentId: parentCommentId ? parentCommentId : null,
		};

		const comments = await prisma.comment.findMany({
			where: commentsWhere,
			orderBy: { createdAt: "desc" },
			skip,
			take: limit,
			select: commentPresentationSelect,
		});
		const total = await prisma.comment.count({ where: commentsWhere });
		const enrichedComments = await hydrateComments(
			comments,
			authenticatedUserId,
		);

		return c.json({
			data: enrichedComments,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	},
});

export { getCommentsRoute };
