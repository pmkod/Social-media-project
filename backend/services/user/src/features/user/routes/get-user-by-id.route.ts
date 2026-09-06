import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import type { HonoEnv } from "@/core/types/hono-env";
import { getPublicUserProfile } from "../services/get-public-user-profile.service";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "get",
	path: "/users/{userId}",
	summary: "Get user by ID",
	tags: [UserRoutesTag],
	request: {
		params: z.object({
			userId: z.string(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
});

const getUserByIdRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoEnv
>({
	route: routeDef,
	handler: async (c) => {
		const { userId } = c.req.valid("param");
		const authenticatedUser = c.get("authenticatedUser");

		const user = await getPublicUserProfile(
			{ id: userId },
			authenticatedUser?.id,
		);

		if (!user) {
			return c.json({ message: "User not found" }, HttpStatus.NOT_FOUND.code);
		}

		return c.json(user);
	},
});

export { getUserByIdRoute };
