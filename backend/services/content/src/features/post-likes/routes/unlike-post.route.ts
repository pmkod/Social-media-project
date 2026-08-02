import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { PostLikesRoutesTag } from "../post-likes.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/posts/{postId}/likes",
	summary: "Unlike a post",
	tags: [PostLikesRoutesTag],
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

		await prisma.postLike.deleteMany({
			where: {
				postId,
				authorId: authenticatedUserId,
			},
		});

		return c.json({ success: true, message: "Post unliked" });
	},
});

export { unlikePostRoute };
