import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { PostsRoutesTag } from "../posts.constants";
import { Post } from "@/generated/prisma/client";

const routeDef = createRoute({
	method: "post",
	path: "/posts/{postId}/likes",
	summary: "Like a post",
	tags: [PostsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			postId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.CREATED.code]: {
			description: "Post liked successfully",
		},
	},
});

const likePostRoute = defineOpenAPIRoute<typeof routeDef, HonoAuthenticatedEnv>(
	{
		route: routeDef,
		handler: async (c) => {
			const authenticatedUserId = c.get("authenticatedUserId");
			if (!authenticatedUserId) {
				throw new Error("Unauthorized");
			}

			const { postId } = c.req.valid("param");

			const post = await prisma.post.findUnique({
				where: { id: postId },
				select: { id: true, authorId: true, likesCount: true },
			});

			if (!post) {
				throw new Error("Post not found");
			}

			let postToSend: Pick<Post, "id" | "likesCount"> | undefined = {
				id: post.id,
				likesCount: post.likesCount,
			};

			try {
				await prisma.postLike.create({
					data: {
						postId,
						authorId: authenticatedUserId,
					},
				});

				postToSend = await prisma.post.update({
					where: { id: postId },
					data: { likesCount: { increment: 1 } },
					select: { id: true, likesCount: true },
				});
			} catch (error) {}

			return c.json(
				{ success: true, message: "Post liked", post: postToSend },
				HttpStatus.CREATED.code,
			);
		},
	},
);

export { likePostRoute };
