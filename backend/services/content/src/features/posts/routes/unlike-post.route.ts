import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import {
	NotificationEventTypes,
	NotificationGroupKeyBuilder,
	notificationServiceClient,
} from "@/core/service-clients/notification-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import type { Post } from "@/generated/prisma/client";
import { PostsRoutesTag } from "../posts.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/content/unlike-post/{postId}",
	summary: "Unlike a post",
	tags: [PostsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			postId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Post unliked successfully",
		},
	},
});

const unlikePostRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;

		const { postId } = c.req.valid("param");

		const post = await prisma.post.findFirst({
			where: { id: postId, exists: true },
			select: { id: true, authorId: true, likesCount: true },
		});

		if (!post) {
			throw new Exception({
				code: ExceptionCodes.post_not_found,
				message: "Post not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}
		let postToSend: Pick<Post, "id" | "likesCount"> | null = {
			id: post.id,
			likesCount: post.likesCount,
		};
		const existingLike = await prisma.postLike.findUnique({
			where: {
				postId_authorId: { postId, authorId: authenticatedUserId },
			},
			select: { postId: true },
		});
		if (existingLike) {
			const [, updatedPost] = await prisma.$transaction([
				prisma.postLike.delete({
					where: {
						postId_authorId: { postId, authorId: authenticatedUserId },
					},
				}),
				prisma.post.update({
					where: { id: postId, exists: true },
					data: { likesCount: { decrement: 1 } },
					select: { id: true, likesCount: true },
				}),
			]);
			postToSend = updatedPost;
			await notificationServiceClient.removeNotification({
				eventType: NotificationEventTypes.POST_LIKE,
				recipientId: post.authorId,
				initiatorId: authenticatedUserId,
				targetId: postId,
				groupKey: NotificationGroupKeyBuilder.buildPostLike(postId),
			});
		}

		return c.json({ message: "Post unliked", post: postToSend });
	},
});

export { unlikePostRoute };
