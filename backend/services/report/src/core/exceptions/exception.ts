import type { ContentfulStatusCode } from "hono/utils/http-status";

type ExceptionOptions = {
	code?: ContentfulStatusCode;
	message?: string;
};

class Exception extends Error {
	readonly code?: ContentfulStatusCode;

	constructor({ code, message }: ExceptionOptions = {}) {
		super(message);
		this.name = "Exception";
		this.code = code;
	}
}

export { Exception };
