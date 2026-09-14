import { HttpStatus } from "@/core/constants/http-status";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import type { HonoEnv } from "@/core/types/hono-env";
import type { Context, Next } from "hono";

const requireUserAuthentication = async (
	c: Context<HonoEnv>,
	next: Next,
) => {
	const authenticatedUser = c.get("authenticatedUser");

	if (!authenticatedUser) {
		throw new Exception({
			code: ExceptionCodes.unauthorized,
			message: "Unauthorized",
			status: HttpStatus.UNAUTHORIZED.code,
		});
	}

	return await next();
};

export { requireUserAuthentication };
