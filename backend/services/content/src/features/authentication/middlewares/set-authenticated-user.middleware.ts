import type { Context, Next } from "hono";
import type { HonoEnv } from "@/core/types/hono-env";

const AuthenticatedUserIdHeader = "X-Authenticated-User-Id";

const setAuthenticatedUser = async (
	c: Context<HonoEnv>,
	next: Next,
) => {
	const authenticatedUserId = c.req.header(AuthenticatedUserIdHeader);

	if (authenticatedUserId) {
		c.set("authenticatedUser", { id: authenticatedUserId });
	}

	return await next();
};

export { setAuthenticatedUser };
