import type { Context, Next } from "hono";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";

const requireUserAuthentication = async (
	c: Context<HonoAuthenticatedEnv>,
	next: Next,
) => {
	const authenticatedUser = c.get("authenticatedUser");

	if (!authenticatedUser) {
		return c.json({ message: "Unauthorized" }, 401);
	}

	return await next();
};

export { requireUserAuthentication };
