import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { Exception } from "./exception";
import { UnauthorizedException } from "./unauthorized.exception";

const exceptionHandler: ErrorHandler = (err, c) => {
	if (err instanceof UnauthorizedException) {
		return c.json({ message: "Unauthorized" }, 401);
	}
	if (err instanceof HTTPException) {
		return c.json({ message: err.message }, err.status);
	}
	if (err instanceof Exception) {
		return c.json(
			{ message: err.message || "Internal Gateway Error" },
			err.code ?? 500,
		);
	}

	console.error("[GATEWAY ERROR]", err);
	return c.json({ message: err.message || "Internal Gateway Error" }, 500);
};

export { exceptionHandler };
