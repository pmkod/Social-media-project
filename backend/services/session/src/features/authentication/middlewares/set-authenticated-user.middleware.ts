import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import type { Context, Next } from "hono";

const AuthenticatedUserIdHeader = "X-Authenticated-User-Id";
const AuthenticatedSessionIdHeader = "X-Authenticated-Session-Id";

const setAuthenticatedUser = async (
	c: Context<HonoAuthenticatedEnv>,
	next: Next,
) => {
	const authenticatedUserId = c.req.header(AuthenticatedUserIdHeader);
	const authenticatedSessionId = c.req.header(AuthenticatedSessionIdHeader);

	if (authenticatedUserId && authenticatedSessionId) {
		c.set("authenticatedUser", {
			id: authenticatedUserId,
			sessionId: authenticatedSessionId,
		});
	}

	return await next();
};

export { setAuthenticatedUser };
