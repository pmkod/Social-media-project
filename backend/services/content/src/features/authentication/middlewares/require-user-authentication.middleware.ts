import type { Context, Next } from "hono";
import type { HonoEnv } from "@/core/types/hono-env";

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
