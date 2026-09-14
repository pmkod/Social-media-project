import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { HttpStatus } from "../constants/http-status";
import { ExceptionCodes } from "./exception.codes";
import { Exception } from "./exception";

const exceptionHandler: ErrorHandler = (error, c) => {
	if (error instanceof Exception) {
		return c.json(
			{
				error: {
					message: error.message || "Something went wrong",
					code: error.code || ExceptionCodes.something_went_wrong,
				},
			},
			error.status ?? HttpStatus.INTERNAL_SERVER_ERROR.code,
		);
	}
	if (error instanceof HTTPException) {
		return c.json(
			{
				error: {
					message: error.message || "Something went wrong",
					code: ExceptionCodes.something_went_wrong,
				},
			},
			error.status,
		);
	}

	console.error("[CHAT SERVICE ERROR]", error);
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
