export const HttpStatus = {
	OK: { code: 200, text: "OK" },
	CREATED: { code: 201, text: "Created" },
	BAD_REQUEST: { code: 400, text: "Bad Request" },
	UNAUTHORIZED: { code: 401, text: "Unauthorized" },
	FORBIDDEN: { code: 403, text: "Forbidden" },
	NOT_FOUND: { code: 404, text: "Not Found" },
	CONFLICT: { code: 409, text: "Conflict" },
	INTERNAL_SERVER_ERROR: { code: 500, text: "Internal Server Error" },
} as const;
