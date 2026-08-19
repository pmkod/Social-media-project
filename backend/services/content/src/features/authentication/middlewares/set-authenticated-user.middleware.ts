import type { Context, Next } from "hono";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";

const AuthenticatedUserIdHeader = "X-Authenticated-User-Id";

const setAuthenticatedUser = async (
	c: Context<HonoAuthenticatedEnv>,
	next: Next,
) => {
	const authenticatedUserId = c.req.header(AuthenticatedUserIdHeader);

	if (authenticatedUserId) {
		c.set("authenticatedUser", { id: authenticatedUserId });
	}

	return await next();
};

export { setAuthenticatedUser };
