import { verifyAccessToken } from "../functions/jwt.functions";
import { UnauthorizedException } from "../exceptions/unauthorized.exception";
import type { AuthenticatedUser } from "../types/authenticated-user";

type AuthenticationResult = { authenticatedUser: AuthenticatedUser };

const verifyAuthorizationHeader = (
	authorizationHeader: string,
): AuthenticationResult => {
	const parts = authorizationHeader.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		throw new UnauthorizedException("Invalid authorization header format");
	}

	const accessToken = parts[1];
	if (!accessToken) {
		throw new UnauthorizedException("Access token missing");
	}

	try {
		const payload = verifyAccessToken(accessToken);
		return {
			authenticatedUser: {
				id: payload.sub,
				refreshTokenId: payload.refreshTokenId,
			},
		};
	} catch (_error) {
		throw new UnauthorizedException("Invalid or expired token");
	}
};

export { verifyAuthorizationHeader };
