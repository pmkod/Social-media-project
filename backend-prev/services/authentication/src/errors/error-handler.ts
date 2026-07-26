import type { Context } from "hono";
import { AppError } from "./app-error";

export function handleError(error: Error, c: Context) {
	if (error instanceof AppError) {
		return c.json(
			{
				success: false,
				error: {
					code: error.code,
					message: error.message,
					...(error.details ? { details: error.details } : {}),
				},
			},
			error.statusCode as 200 | 201 | 400 | 401 | 403 | 404 | 409 | 500,
		);
	}

	console.error("Unhandled error:", error);
	return c.json(
		{
			success: false,
			error: {
				code: "INTERNAL_ERROR",
				message: "An unexpected error occurred",
			},
		},
		500,
	);
}
