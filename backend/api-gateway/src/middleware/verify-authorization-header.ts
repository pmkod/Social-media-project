import { parseSessionAuthorizationHeader } from "../functions/session-authorization.functions";
import { sessionServiceClient } from "../service-clients/session-service.client";
import type { AuthenticatedUser } from "../types/authenticated-user";

type AuthenticationResult = { authenticatedUser: AuthenticatedUser };

const verifyAuthorizationHeader = (
	authorizationHeader: string,
): Promise<AuthenticationResult> => {
	const { sessionId, sessionToken } =
		parseSessionAuthorizationHeader(authorizationHeader);

	return sessionServiceClient
		.verifySession(sessionId, sessionToken)
		.then(({ session }) => ({
			authenticatedUser: { id: session.userId, sessionId: session.id },
		}));
};

export { verifyAuthorizationHeader };
