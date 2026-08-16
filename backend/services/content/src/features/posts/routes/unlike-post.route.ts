import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { PostsRoutesTag } from "../posts.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/posts/{postId}/likes",
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

		const deleted = await prisma.postLike.deleteMany({
			where: {
				postId,
				authorId: authenticatedUserId,
			},
		});

		if (deleted.count > 0) {
			await prisma.post.update({
				where: { id: postId },
				data: {
					likesCount: {
						decrement: 1,
					},
				},
			});
		}

		const { likesCount } = await prisma.post.findUniqueOrThrow({
			where: { id: postId },
			select: { likesCount: true },
		});

		return c.json({
			success: true,
			message: "Post unliked",
			likesCount,
		});
	},
});

export { unlikePostRoute };
