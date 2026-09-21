import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "patch",
	path: "/internal/user/update-post-count/{userId}",
	summary: "Update a user post count from the content service",
	tags: [UserRoutesTag],
	request: {
		params: z.object({ userId: z.string() }),
		body: {
			content: {
				"application/json": {
					schema: z.object({ delta: z.number().int().min(-1).max(1) }),
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Post count updated" },
	},
});

const updatePostCountRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const { delta } = c.req.valid("json");
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { postCount: true },
		});
		if (!user) {
			throw new Exception({
				code: ExceptionCodes.user_not_found,
				message: "User not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { postCount: Math.max(0, user.postCount + delta) },
			select: { postCount: true },
		});
		return c.json(updatedUser);
	},
});

export { updatePostCountRoute };
