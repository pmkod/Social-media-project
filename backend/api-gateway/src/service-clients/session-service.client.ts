import { Configurations } from "../configurations";
import { internalHttpClient } from "../http-clients/internal.http-client";

type VerifiedSessionResponse = {
	session: {
		id: string;
		userId: string;
		active: true;
	};
};

const sessionServiceHttpClient = internalHttpClient.extend({
	prefix: Configurations.session.serviceUrl,
});

const sessionServiceClient = {
	async verifySession(sessionId: string, sessionToken: string) {
		return await sessionServiceHttpClient
			.post("internal/session/verify-session", {
				json: { id: sessionId, token: sessionToken },
			})
			.json<VerifiedSessionResponse>();
	},
};

export { sessionServiceClient };
