import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { HttpStatus } from "../constants/http-status";
import { ExceptionCodes } from "./exception.codes";
import { Exception } from "./exception";

const exceptionHandler: ErrorHandler = (err, c) => {
	if (err instanceof Exception) {
		return c.json(
			{
				error: {
					message: err.message || "Something went wrong",
					code: err.code || ExceptionCodes.something_went_wrong,
				},
			},
			err.status ?? HttpStatus.INTERNAL_SERVER_ERROR.code,
		);
	}
	if (err instanceof HTTPException) {
		return c.json(
			{
				error: {
					message: err.message || "Something went wrong",
					code: ExceptionCodes.something_went_wrong,
				},
			},
			err.status,
		);
	}

	console.error("[REPORT SERVICE ERROR]", err.message);
	return c.json(
		{
			error: {
				message: "Something went wrong",
				code: ExceptionCodes.something_went_wrong,
			},
		},
		HttpStatus.INTERNAL_SERVER_ERROR.code,
	);
};

export { exceptionHandler };
