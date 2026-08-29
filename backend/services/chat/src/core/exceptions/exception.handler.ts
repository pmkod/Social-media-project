import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

const exceptionHandler: ErrorHandler = (error, c) => {
	if (error instanceof HTTPException) {
		return c.json({ message: error.message }, error.status);
	}

	console.error("[CHAT SERVICE ERROR]", error);
	return c.json({ message: "Something went wrong" }, 500);
};

export { exceptionHandler };
