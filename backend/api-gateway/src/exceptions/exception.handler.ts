import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { UnauthorizedException } from "./unauthorized.exception";

const exceptionHandler: ErrorHandler = (err, c) => {
	if (err instanceof UnauthorizedException) {
		return c.json({ message: err.message }, 401);
	}
	if (err instanceof HTTPException) {
		return c.json({ message: err.message }, err.status);
	}

	console.error("[GATEWAY ERROR]", err);
	return c.json({ message: err.message || "Internal Gateway Error" }, 500);
};

export { exceptionHandler };
