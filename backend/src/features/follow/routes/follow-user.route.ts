import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases/postgresql";
import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import { controlUserAccess } from "@/features/authorization/authorization.middlewares";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { FollowRoutesTag } from "../follow.constants";
import { FollowUserValidationSchema } from "../follow.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/",
	summary: "Follow user",
	tags: [FollowRoutesTag],
	request: {
		body: {
			content: {
				"application/json": {
					schema: FollowUserValidationSchema,
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
	middleware: [controlUserAccess],
});

const followUserRoute = new OpenAPIHono<HonoContextVariables>().openapi(
	routeDef,
	async (c) => {
		const reqBody = c.req.valid("json");
		const loggedInUser = c.get("loggedInUser");

		if (!loggedInUser) {
			throw Error();
		}

		await prisma.follow.create({
			data: {
				followerId: loggedInUser.id,
				followedId: reqBody.followedId,
			},
		});

		return c.newResponse(null, 200);
	},
);

export { followUserRoute };
