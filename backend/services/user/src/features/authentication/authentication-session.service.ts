import { sessionServiceClient } from "@/core/services/session-service.client";

type ClientMetadata = {
	ipAddress: string | null;
	userAgent: string | null;
};

type CreateAuthenticatedResponseParams = {
	user: { id: string };
	clientMetadata: ClientMetadata;
};

const createAuthenticatedResponse = async ({
	user,
	clientMetadata,
}: CreateAuthenticatedResponseParams) => {
	const session = await sessionServiceClient.createSession({
		userId: user.id,
		...clientMetadata,
	});

	return {
		session: {
			id: session.id,
			token: session.token,
		},
	};
};

export { createAuthenticatedResponse };
