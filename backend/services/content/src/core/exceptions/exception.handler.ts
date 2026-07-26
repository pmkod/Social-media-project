import type { ErrorHandler } from "hono";

const exceptionHandler: ErrorHandler = (err, c) => {
	console.error("[CONTENT SERVICE ERROR]", err.message);
	return c.json({ message: err.message || "Something went wrong" }, 400);
};

export { exceptionHandler };
