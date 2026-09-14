import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { Exception } from "./exception";

const exceptionHandler: ErrorHandler = (error, c) => {
	if (error instanceof HTTPException) {
		return c.json({ message: error.message }, error.status);
	}
	if (error instanceof Exception) {
		return c.json(
			{ message: error.message || "Something went wrong" },
			error.code ?? 500,
		);
	}

	console.error("[SESSION SERVICE ERROR]", error);
	return c.json({ message: "Something went wrong" }, 500);
};

export { exceptionHandler };
