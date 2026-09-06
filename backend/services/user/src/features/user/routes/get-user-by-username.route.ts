import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import type { HonoEnv } from "@/core/types/hono-env";
import { getPublicUserProfile } from "../services/get-public-user-profile.service";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "get",
	path: "/users/by-username/{username}",
	summary: "Get a public user profile by username",
	tags: [UserRoutesTag],
	request: { params: z.object({ username: z.string().min(1) }) },
	responses: {
		[HttpStatus.OK.code]: { description: "Public user profile" },
		[HttpStatus.NOT_FOUND.code]: { description: "User not found" },
	},
});

const getUserByUsernameRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoEnv
>({
	route: routeDef,
	handler: async (c) => {
		const { username } = c.req.valid("param");
		const authenticatedUser = c.get("authenticatedUser");
		const user = await getPublicUserProfile(
			{ username },
			authenticatedUser?.id,
		);

		if (!user) {
			return c.json({ message: "User not found" }, HttpStatus.NOT_FOUND.code);
		}

		return c.json({ user });
	},
});

export { getUserByUsernameRoute };
