import type { HonoContextVariables } from "@/core/types/hono-context-variables";
import type { Context, Next } from "hono";
import { verifyAccessToken } from "../authentication/jwt.functions";
import { USER_ROLES } from "../user/user-roles.constants";

type ControlUserAccessOptions = {
	roles: string[];
};

const controlUserAccess = (options?: ControlUserAccessOptions) => {
	return async (c: Context<HonoContextVariables>, next: Next) => {
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

			if (options !== undefined) {
				if (!options.roles.includes(accessTokenPayload.userRole)) {
					throw Error();
				}
			}

			const loggedInUser = {
				id: accessTokenPayload.userId,
				refreshTokenId: accessTokenPayload.refreshTokenId,
			};
			c.set("loggedInUser", loggedInUser);
			await next();
		} catch (_error) {
			c.json({ message: "Not found" }, 401);
		}
	};
};

const controlUserAccessForCustomer = controlUserAccess({
	roles: [USER_ROLES.customer],
});
const controlUserAccessForSeller = controlUserAccess({
	roles: [USER_ROLES.seller],
});

const controlUserAccessForCustomerAndSeller = controlUserAccess({
	roles: [USER_ROLES.customer, USER_ROLES.seller],
});

export {
	controlUserAccess,
	controlUserAccessForCustomer,
	controlUserAccessForCustomerAndSeller,
	controlUserAccessForSeller,
};
