import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { PostsRoutesTag } from "../posts.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/posts/{id}",
	summary: "Delete a post",
	tags: [PostsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		params: z.object({
			id: z.string(),
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
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) {
			throw new Error("Unauthorized");
		}

		const { id } = c.req.valid("param");

		const existingPost = await prisma.post.findUnique({
			where: { id },
		});

		if (!existingPost) {
			throw new Error("Post not found");
		}

		if (existingPost.authorId !== authenticatedUserId) {
			throw new Error("You are not authorized to delete this post");
		}

		await prisma.post.delete({
			where: { id },
		});

		return c.json({ success: true, message: "Post deleted successfully" });
	},
});

export { deletePostRoute };
