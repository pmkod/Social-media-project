import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoEnv } from "@/core/types/hono-env";
import { CommentsRoutesTag } from "../comments.constants";
import {
	commentPresentationSelect,
	hydrateComments,
	type CommentPresentationRecord,
} from "../services/comment-presentation.service";

const routeDef = createRoute({
	method: "get",
	path: "/posts/{postId}/comments/{commentId}",
	summary: "Get a comment and its parent thread",
	tags: [CommentsRoutesTag],
	request: {
		params: z.object({
			postId: z.string(),
			commentId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Comment details with its parent comments",
		},
		[HttpStatus.NOT_FOUND.code]: { description: "Comment not found" },
	},
});

const getCommentByIdRoute = defineOpenAPIRoute<typeof routeDef, HonoEnv>({
	route: routeDef,
	handler: async (c) => {
		const { postId, commentId } = c.req.valid("param");
		const post = await prisma.post.findFirst({
			where: { id: postId, exists: true },
			select: { authorId: true },
		});
		const comment = await prisma.comment.findFirst({
			where: { id: commentId, postId },
			select: commentPresentationSelect,
		});

		if (!post || !comment) {
			throw new Exception({
				code: ExceptionCodes.comment_not_found,
				message: "Comment not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}

		const authenticatedUserId = c.get("authenticatedUser")?.id;
		if (
			authenticatedUserId &&
			(await userServiceClient.hasBlockRelationship(
				authenticatedUserId,
				post.authorId,
			))
		) {
			throw new Exception({
				code: ExceptionCodes.comment_not_found,
				message: "Comment not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}

		const parentComments: CommentPresentationRecord[] = [];
		const visitedCommentIds = new Set([comment.id]);
		let parentId = comment.parentId;

		while (parentId && !visitedCommentIds.has(parentId)) {
			visitedCommentIds.add(parentId);
			const parentComment = await prisma.comment.findFirst({
				where: { id: parentId, postId },
				select: commentPresentationSelect,
			});
			if (!parentComment) break;
			parentComments.unshift(parentComment);
			parentId = parentComment.parentId;
		}

		const [hydratedComment, ...hydratedParents] = await hydrateComments(
			[comment, ...parentComments],
			authenticatedUserId,
		);

		return c.json({
			comment: hydratedComment,
			parentComments: hydratedParents,
		});
	},
});

export { getCommentByIdRoute };
