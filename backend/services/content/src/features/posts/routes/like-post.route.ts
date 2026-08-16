import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { PostsRoutesTag } from "../posts.constants";

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

const likePostRoute = defineOpenAPIRoute<typeof routeDef, HonoAuthenticatedEnv>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) {
			throw new Error("Unauthorized");
		}

		const { postId } = c.req.valid("param");

		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { id: true },
		});

		if (!post) {
			throw new Error("Post not found");
		}

		const existingLike = await prisma.postLike.findUnique({
			where: {
				postId_authorId: {
					postId,
					authorId: authenticatedUserId,
				},
			},
			select: { id: true },
		});

		if (!existingLike) {
			await prisma.$transaction([
				prisma.postLike.create({
					data: {
						postId,
						authorId: authenticatedUserId,
					},
				}),
				prisma.post.update({
					where: { id: postId },
					data: { likesCount: { increment: 1 } },
				}),
			]);
		}

		const { likesCount } = await prisma.post.findUniqueOrThrow({
			where: { id: postId },
			select: { likesCount: true },
		});

		return c.json(
			{ success: true, message: "Post liked", likesCount },
			HttpStatus.CREATED.code,
		);
	},
});

export { likePostRoute };
