import type { HonoEnv } from "@/core/types/hono-env";
import type { Context, Next } from "hono";

const requireUserAuthentication = async (
	c: Context<HonoEnv>,
	next: Next,
) => {
	const authenticatedUser = c.get("authenticatedUser");

	if (!authenticatedUser) {
		return c.json({ message: "Unauthorized" }, 401);
	}

	return await next();
};

export { requireUserAuthentication };
