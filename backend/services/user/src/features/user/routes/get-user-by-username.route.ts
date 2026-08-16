import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { UserRoutesTag } from "../user.constants";
import { getPublicUserProfile } from "../services/get-public-user-profile.service";

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

const getUserByUsernameRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { username } = c.req.valid("param");
		const user = await getPublicUserProfile(
			{ username },
			c.req.header("X-Authenticated-User-Id"),
		);

		if (!user) {
			return c.json({ message: "User not found" }, HttpStatus.NOT_FOUND.code);
		}

		return c.json(user);
	},
});

export { getUserByUsernameRoute };
