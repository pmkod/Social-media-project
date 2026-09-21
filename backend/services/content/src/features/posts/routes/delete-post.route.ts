import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { PostsRoutesTag } from "../posts.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/content/delete-post/{postId}",
	summary: "Delete a post",
	tags: [PostsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			postId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Post deleted",
		},
	},
});

const deletePostRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUser").id;

		const { postId } = c.req.valid("param");

		await prisma.post.update({
			where: { id: postId, authorId: authenticatedUserId, exists: true },
			data: { exists: false },
		});

		await userServiceClient.adjustPostCount(authenticatedUserId, -1);

		return c.json({ message: "Post deleted successfully" });
	},
});

export { deletePostRoute };
