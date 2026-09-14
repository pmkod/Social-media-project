const HttpStatus = {
	OK: { code: 200, message: "OK" },
	CREATED: { code: 201, message: "Created" },
	NO_CONTENT: { code: 204, message: "No Content" },
	PARTIAL_CONTENT: { code: 206, message: "Partial Content" },
	BAD_REQUEST: { code: 400, message: "Bad Request" },
	UNAUTHORIZED: { code: 401, message: "Unauthorized" },
	FORBIDDEN: { code: 403, message: "Forbidden" },
	NOT_FOUND: { code: 404, message: "Not Found" },
	CONFLICT: { code: 409, message: "Conflict" },
	REQUESTED_RANGE_NOT_SATISFIABLE: {
		code: 416,
		message: "Requested Range Not Satisfiable",
	},
	INTERNAL_SERVER_ERROR: { code: 500, message: "Internal Server Error" },
} as const;

export { HttpStatus };
