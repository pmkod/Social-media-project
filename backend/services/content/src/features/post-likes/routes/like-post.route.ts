import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { PostLikesRoutesTag } from "../post-likes.constants";

const routeDef = createRoute({
	method: "post",
	path: "/posts/{postId}/likes",
	summary: "Like a post",
	tags: [PostLikesRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			postId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
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
			});

			if (!post) {
				throw new Error("Post not found");
			}

			const postLike = await prisma.postLike.upsert({
				where: {
					postId_authorId: {
						postId,
						authorId: authenticatedUserId,
					},
				},
				update: {},
				create: {
					postId,
					authorId: authenticatedUserId,
				},
			});

			return c.json(postLike);
		},
	},
);

export { likePostRoute };
