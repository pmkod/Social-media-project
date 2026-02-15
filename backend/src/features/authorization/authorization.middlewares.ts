import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import type { Context, Next } from "hono";
import { verifyAccessToken } from "../authentication/jwt.functions";

const controlUserAccess = async (
	c: Context<HonoContextVariables>,
	next: Next,
) => {
	const authorizationHeader = c.req.header("Authorization");

	if (!authorizationHeader) {
		throw Error();
	}

	try {
		const accessToken = authorizationHeader.split(" ")[1];

		if (!accessToken) {
			throw Error();
		}

		const accessTokenPayload = verifyAccessToken(accessToken);

		const loggedInUser = {
			id: accessTokenPayload.userId,
			refreshTokenId: accessTokenPayload.refreshTokenId,
		};

		c.set("loggedInUser", loggedInUser);
		return await next();
	} catch (_error) {
		return c.json({ message: "Not found" }, 401);
	}
};

export { controlUserAccess };
