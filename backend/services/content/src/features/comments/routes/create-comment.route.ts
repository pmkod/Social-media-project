import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { CommentsRoutesTag } from "../comments.constants";

const CreateCommentRequestBody = z.object({
	postId: z.string(),
	parentCommentId: z.string().optional(),
	content: z.string().min(1).max(2000),
});

const routeDef = createRoute({
	method: "post",
	path: "/comments",
	summary: "Add a comment to a post",
	tags: [CommentsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		body: {
			content: {
				"multipart/form-data": {
					schema: CreateCommentRequestBody,
				},
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: {
			description: "Comment created",
		},
	},
});

const createCommentRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) {
			throw new Error("Unauthorized");
		}

		const { postId, parentCommentId, content } = c.req.valid("form");

		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { id: true, authorId: true },
		});

		if (!post) {
			throw Error("Post not found");
		}
		if (
			await userServiceClient.hasBlockRelationship(
				authenticatedUserId,
				post.authorId,
			)
		) {
			throw Error("Post not found");
		}

		let parentId: string | null = null;
		if (parentCommentId) {
			const parentComment = await prisma.comment.findUnique({
				where: { id: parentCommentId },
				select: { id: true, parentId: true, postId: true },
			});

			if (!parentComment || parentComment.postId !== postId) {
				throw Error("Parent comment not found");
			}

			parentId = parentComment.id;
		}

		const comment = await prisma.comment.create({
			data: {
				postId,
				parentId,
				authorId: authenticatedUserId,
				content: content.trim(),
			},
			select: {
				id: true,
			},
		});

		await prisma.post.update({
			where: { id: postId },
			data: { commentsCount: { increment: 1 } },
		});

		if (parentId) {
			await prisma.comment.update({
				where: { id: parentId },
				data: { repliesCount: { increment: 1 } },
			});
		}

		const commentToSend = await prisma.comment.findUniqueOrThrow({
			where: {
				id: comment.id,
			},
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
		});

		const authorsMap = await userServiceClient.fetchAuthorsBatch(
			[authenticatedUserId],
			authenticatedUserId,
		);
		const author = authorsMap.get(authenticatedUserId) ?? null;

		return c.json(
			{
				message: "Comment created successfully",
				comment: {
					...commentToSend,
					isLikedByAuthenticatedUser: false,
					author,
				},
			},
			HttpStatus.CREATED.code,
		);
	},
});

export { createCommentRoute };
