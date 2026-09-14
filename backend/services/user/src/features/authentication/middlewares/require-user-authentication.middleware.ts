import type { Context, Next } from "hono";
import { HttpStatus } from "@/core/constants/http-status";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import type { HonoEnv } from "@/core/types/hono-env";

const requireUserAuthentication = async (
	c: Context<HonoEnv>,
	next: Next,
) => {
	if (!c.get("authenticatedUser")) {
		throw new Exception({
			code: ExceptionCodes.unauthorized,
			message: "Unauthorized",
			status: HttpStatus.UNAUTHORIZED.code,
		});
	}

	return await next();
};

export { requireUserAuthentication };
