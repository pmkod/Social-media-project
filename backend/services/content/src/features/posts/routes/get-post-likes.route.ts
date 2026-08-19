import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { PostsRoutesTag } from "../posts.constants";

const routeDef = createRoute({
	method: "get",
	path: "/posts/{postId}/likes",
	summary: "Get likes for a post",
	tags: [PostsRoutesTag],
	request: {
		params: z.object({
			postId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Likes count and authors",
		},
	},
});

const getPostLikesRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const { postId } = c.req.valid("param");
		const authenticatedUser = c.get("authenticatedUser");
		const authenticatedUserId = authenticatedUser?.id;
		const post = await prisma.post.findUnique({
			where: { id: postId },
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
			return c.json({ count: 0, likes: [] });
		}

		const [likes, count] = await Promise.all([
			prisma.postLike.findMany({
				where: { postId },
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					authorId: true,
					createdAt: true,
				},
			}),
			prisma.postLike.count({ where: { postId } }),
		]);

		return c.json({ count, likes });
	},
});

export { getPostLikesRoute };
