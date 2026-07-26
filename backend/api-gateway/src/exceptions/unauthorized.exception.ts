class UnauthorizedException extends Error {
	constructor(message = "Unauthorized") {
		super(message);
		this.name = "UnauthorizedException";
	}
}

export { UnauthorizedException };
