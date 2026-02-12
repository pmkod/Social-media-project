import type { ErrorHandler } from "hono";

const exceptionHandler: ErrorHandler = (err, c) => {
	// if (c.headersSent) {
	// 	return next(err);
	// }
	console.log(err.message);
	console.log(err);

	return c.json({ message: err.message || "Something went wrong" }, 400);
};

export { exceptionHandler };
