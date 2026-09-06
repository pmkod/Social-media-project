import { parseSessionAuthorizationHeader } from "../functions/session-authorization.functions";
import { sessionServiceClient } from "../services/session-service.client";
import type { AuthenticatedUser } from "../types/authenticated-user";

type AuthenticationResult = { authenticatedUser: AuthenticatedUser };

const verifyAuthorizationHeader = (
	authorizationHeader: string,
): Promise<AuthenticationResult> => {
	const { sessionId, sessionToken } =
		parseSessionAuthorizationHeader(authorizationHeader);

	return sessionServiceClient
		.verifySession(sessionId, sessionToken)
		.then((authenticatedUser) => ({ authenticatedUser }));
};

export { verifyAuthorizationHeader };
