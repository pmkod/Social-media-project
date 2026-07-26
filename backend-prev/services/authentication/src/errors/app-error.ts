export class AppError extends Error {
	public readonly code: string;
	public readonly statusCode: number;
	public readonly details?: Record<string, unknown>;

	constructor({
		message,
		code,
		statusCode,
		details,
	}: {
		message: string;
		code: string;
		statusCode: number;
		details?: Record<string, unknown>;
	}) {
		super(message);
		this.name = "AppError";
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;
	}
}

export const ErrorCodes = {
	BAD_REQUEST: "BAD_REQUEST",
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	NOT_FOUND: "NOT_FOUND",
	CONFLICT: "CONFLICT",
	INTERNAL_ERROR: "INTERNAL_ERROR",
	VERIFICATION_EXPIRED: "VERIFICATION_EXPIRED",
	VERIFICATION_INVALID: "VERIFICATION_INVALID",
	INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
} as const;
