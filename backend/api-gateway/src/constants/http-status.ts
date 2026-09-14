const HttpStatus = {
	UNAUTHORIZED: { code: 401, message: "Unauthorized" },
	NOT_FOUND: { code: 404, message: "Not Found" },
	INTERNAL_SERVER_ERROR: { code: 500, message: "Internal Server Error" },
	SERVICE_UNAVAILABLE: { code: 503, message: "Service Unavailable" },
} as const;

export { HttpStatus };
