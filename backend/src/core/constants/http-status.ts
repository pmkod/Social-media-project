const HttpStatus = {
	CONTINUE: {
		use: "Informational",
		code: 100,
		text: "Continue",
	},
	SWITCHING_PROTOCOLS: {
		use: "Informational",
		code: 101,
		text: "Switching Protocols",
	},
	PROCESSING: {
		use: "Informational",
		code: 102,
		text: "Processing",
	},
	OK: {
		use: "Success",
		code: 200,
		text: "OK",
	},
	CREATED: {
		use: "Success",
		code: 201,
		text: "Created",
	},
	ACCEPTED: {
		use: "Success",
		code: 202,
		text: "Accepted",
	},
	NON_AUTHORITATIVE_INFORMATION: {
		use: "Success",
		code: 203,
		text: "Non Authoritative Information",
	},
	NO_CONTENT: {
		use: "Success",
		code: 204,
		text: "No Content",
	},
	RESET_CONTENT: {
		use: "Success",
		code: 205,
		text: "Reset Content",
	},
	PARTIAL_CONTENT: {
		use: "Success",
		code: 206,
		text: "Partial Content",
	},
	MULTI: {
		use: "Success",
		code: 207,
		text: "Multi-Status",
	},
	ALREADY_REPORTED: {
		use: "Success",
		code: 208,
		text: "Already Reported",
	},
	IM_USED: {
		use: "Success",
		code: 226,
		text: "IM Used",
	},
	MULTIPLE_CHOICES: {
		use: "Redirection",
		code: 300,
		text: "Multiple Choices",
	},
	MOVED_PERMANENTLY: {
		use: "Redirection",
		code: 301,
		text: "Moved Permanently",
	},
	FOUND: {
		use: "Redirection",
		code: 302,
		text: "Found",
	},
	SEE_OTHER: {
		use: "Redirection",
		code: 303,
		text: "See Other",
	},
	NOT_MODIFIED: {
		use: "Redirection",
		code: 304,
		text: "Not Modified",
	},
	USE_PROXY: {
		use: "Redirection",
		code: 305,
		text: "Use Proxy",
	},
	TEMPORARY_REDIRECT: {
		use: "Redirection",
		code: 307,
		text: "Temporary Redirect",
	},
	PERMANENT_REDIRECT: {
		use: "Redirection",
		code: 308,
		text: "Permanent Redirect",
	},
	BAD_REQUEST: {
		use: "Client_Error",
		code: 400,
		text: "Bad Request",
	},
	UNAUTHORIZED: {
		use: "Client_Error",
		code: 401,
		text: "Unauthorized",
	},
	PAYMENT_REQUIRED: {
		use: "Client_Error",
		code: 402,
		text: "Payment Required",
	},
	FORBIDDEN: {
		use: "Client_Error",
		code: 403,
		text: "Forbidden",
	},
	NOT_FOUND: {
		use: "Client_Error",
		code: 404,
		text: "Not Found",
	},
	METHOD_NOT_ALLOWED: {
		use: "Client_Error",
		code: 405,
		text: "Method Not Allowed",
	},
	NOT_ACCEPTABLE: {
		use: "Client_Error",
		code: 406,
		text: "Not Acceptable",
	},
	PROXY_AUTHENTICATION_REQUIRED: {
		use: "Client_Error",
		code: 407,
		text: "Proxy Authentication Required",
	},
	REQUEST_TIMEOUT: {
		use: "Client_Error",
		code: 408,
		text: "Request Timeout",
	},
	CONFLICT: {
		use: "Client_Error",
		code: 409,
		text: "Conflict",
	},
	GONE: {
		use: "Client_Error",
		code: 410,
		text: "Gone",
	},
	LENGTH_REQUIRED: {
		use: "Client_Error",
		code: 411,
		text: "Length Required",
	},
	PRECONDITION_FAILED: {
		use: "Client_Error",
		code: 412,
		text: "Precondition Failed",
	},
	PAYLOAD_TOO_LARGE: {
		use: "Client_Error",
		code: 413,
		text: "Payload Too Large",
	},
	REQUEST_URI_TOO_LONG: {
		use: "Client_Error",
		code: 414,
		text: "Request URI Too Long",
	},
	UNSUPPORTED_MEDIA_TYPE: {
		use: "Client_Error",
		code: 415,
		text: "Unsupported Media Type",
	},
	REQUESTED_RANGE_NOT_SATISFIABLE: {
		use: "Client_Error",
		code: 416,
		text: "Requested Range Not Satisfiable",
	},
	EXPECTATION_FAILED: {
		use: "Client_Error",
		code: 417,
		text: "Expectation Failed",
	},
	I: {
		use: "Client_Error",
		code: 418,
		text: "I'm a teapot",
	},
	MISDIRECTED_REQUEST: {
		use: "Client_Error",
		code: 421,
		text: "Misdirected Request",
	},
	UNPROCESSABLE_ENTITY: {
		use: "Client_Error",
		code: 422,
		text: "Unprocessable Entity",
	},
	LOCKED: {
		use: "Client_Error",
		code: 423,
		text: "Locked",
	},
	FAILED_DEPENDENCY: {
		use: "Client_Error",
		code: 424,
		text: "Failed Dependency",
	},
	UPGRADE_REQUIRED: {
		use: "Client_Error",
		code: 426,
		text: "Upgrade Required",
	},
	PRECONDITION_REQUIRED: {
		use: "Client_Error",
		code: 428,
		text: "Precondition Required",
	},
	TOO_MANY_REQUESTS: {
		use: "Client_Error",
		code: 429,
		text: "Too Many Requests",
	},
	REQUEST_HEADER_FIELDS_TOO_LARGE: {
		use: "Client_Error",
		code: 431,
		text: "Request Header Fields Too Large",
	},
	CONNECTION_CLOSED_WITHOUT_RESPONSE: {
		use: "Client_Error",
		code: 444,
		text: "Connection Closed Without Response",
	},
	UNAVAILABLE_FOR_LEGAL_REASONS: {
		use: "Client_Error",
		code: 451,
		text: "Unavailable For Legal Reasons",
	},
	CLIENT_CLOSED_REQUEST: {
		use: "Client_Error",
		code: 499,
		text: "Client Closed Request",
	},
	INTERNAL_SERVER_ERROR: {
		use: "Server_Error",
		code: 500,
		text: "Internal Server Error",
	},
	NOT_IMPLEMENTED: {
		use: "Server_Error",
		code: 501,
		text: "Not Implemented",
	},
	BAD_GATEWAY: {
		use: "Server_Error",
		code: 502,
		text: "Bad Gateway",
	},
	SERVICE_UNAVAILABLE: {
		use: "Server_Error",
		code: 503,
		text: "Service Unavailable",
	},
	GATEWAY_TIMEOUT: {
		use: "Server_Error",
		code: 504,
		text: "Gateway Timeout",
	},
	HTTP_VERSION_NOT_SUPPORTED: {
		use: "Server_Error",
		code: 505,
		text: "HTTP Version Not Supported",
	},
	VARIANT_ALSO_NEGOTIATES: {
		use: "Server_Error",
		code: 506,
		text: "Variant Also Negotiates",
	},
	INSUFFICIENT_STORAGE: {
		use: "Server_Error",
		code: 507,
		text: "Insufficient Storage",
	},
	LOOP_DETECTED: {
		use: "Server_Error",
		code: 508,
		text: "Loop Detected",
	},
	NOT_EXTENDED: {
		use: "Server_Error",
		code: 510,
		text: "Not Extended",
	},
	NETWORK_AUTHENTICATION_REQUIRED: {
		use: "Server_Error",
		code: 511,
		text: "Network Authentication Required",
	},
	NETWORK_CONNECT_TIMEOUT_ERROR: {
		use: "Server_Error",
		code: 599,
		text: "Network Connect Timeout Error",
	},
};

export { HttpStatus };
