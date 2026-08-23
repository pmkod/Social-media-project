import type { ErrorHandler } from "hono";

const exceptionHandler: ErrorHandler = (err, c) => {
	console.error("[REPORT SERVICE ERROR]", err.message);
	return c.json({ message: err.message || "Something went wrong" }, 400);
};

export { exceptionHandler };
