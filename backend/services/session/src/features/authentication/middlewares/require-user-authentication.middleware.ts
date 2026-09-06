import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import type { Context, Next } from "hono";

const requireUserAuthentication = async (
	c: Context<HonoAuthenticatedEnv>,
	next: Next,
) => {
	const authenticatedUser = c.get("authenticatedUser");
	if (!authenticatedUser) {
		return c.json({ message: "Unauthorized" }, 401);
	}

	c.set("authenticatedUserId", authenticatedUser.id);
	c.set("authenticatedSessionId", authenticatedUser.sessionId);
	return await next();
};

export { requireUserAuthentication };
