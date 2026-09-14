import type { ContentfulStatusCode } from "hono/utils/http-status";

type ExceptionOptions = {
	code?: string;
	message?: string;
	status?: ContentfulStatusCode;
};

class Exception extends Error {
	readonly code?: string;
	readonly status?: ContentfulStatusCode;

	constructor({ code, message, status }: ExceptionOptions = {}) {
		super(message);
		this.name = "Exception";
		this.code = code;
		this.status = status;
	}
}

export { Exception };
