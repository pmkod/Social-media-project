import type { ErrorHandler } from "hono";
import { Exception } from "./exception";

const exceptionHandler: ErrorHandler = (err, c) => {
	if (err instanceof Exception) {
		return c.json(
			{ message: err.message || "Something went wrong" },
			err.code ?? 400,
		);
	}

	console.error("[REPORT SERVICE ERROR]", err.message);
	return c.json({ message: err.message || "Something went wrong" }, 400);
};

export { exceptionHandler };
