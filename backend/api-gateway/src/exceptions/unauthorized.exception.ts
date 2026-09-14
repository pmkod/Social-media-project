import { HttpStatus } from "../constants/http-status";
import { ExceptionCodes } from "./exception.codes";
import { Exception } from "./exception";

class UnauthorizedException extends Exception {
	constructor() {
		super({
			code: ExceptionCodes.unauthorized,
			message: "Unauthorized",
			status: HttpStatus.UNAUTHORIZED.code,
		});
		this.name = "UnauthorizedException";
	}
}

export { UnauthorizedException };
