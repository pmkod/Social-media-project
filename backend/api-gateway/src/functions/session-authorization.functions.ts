import { UnauthorizedException } from "../exceptions/unauthorized.exception";

type SessionCredentials = {
	sessionId: string;
	sessionToken: string;
};

const parseSessionAuthorizationHeader = (
	authorizationHeader: string,
): SessionCredentials => {
	const parts = authorizationHeader.split(" ");
	if (parts.length !== 2 || parts[0] !== "Session") {
		throw new UnauthorizedException("Invalid authorization header format");
	}

	const credentials = parts[1];
	if (!credentials) {
		throw new UnauthorizedException("Session credentials missing");
	}

	const separatorIndex = credentials.indexOf(".");
	if (separatorIndex <= 0 || separatorIndex === credentials.length - 1) {
		throw new UnauthorizedException("Invalid session credentials format");
	}

	return {
		sessionId: credentials.slice(0, separatorIndex),
		sessionToken: credentials.slice(separatorIndex + 1),
	};
};

export { parseSessionAuthorizationHeader };
