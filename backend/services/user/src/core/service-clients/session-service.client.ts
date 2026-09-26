import { HTTPError } from "ky";
import { Configurations } from "@/core/configurations";
import { HttpStatus } from "@/core/constants/http-status";
import { Exception } from "@/core/exceptions/exception";
import { internalHttpClient } from "@/core/http-clients/internal.http-client";

type Session = {
	id: string;
	token: string;
};

type CreateSessionInput = {
	userId: string;
	ipAddress: string | null;
	userAgent: string | null;
};

type CreateSessionResponse = {
	session: Session;
};

type DisableSessionInput = {
	userId: string;
	sessionId: string;
};

const sessionServiceHttpClient = internalHttpClient.extend({
	prefix: Configurations.server.sessionServiceUrl,
});

const sessionServiceClient = {
	async createSession(
		input: CreateSessionInput,
	): Promise<CreateSessionResponse> {
		return await sessionServiceHttpClient
			.post("internal/session/create-session", { json: input })
			.json<CreateSessionResponse>();
	},

	async disableSession({
		userId,
		sessionId,
	}: DisableSessionInput): Promise<void> {
		await sessionServiceHttpClient.patch(
			`session/disable-session/${encodeURIComponent(sessionId)}`,
			{
				headers: {
					"X-Authenticated-User-Id": userId,
					"X-Authenticated-Session-Id": sessionId,
				},
			},
		);
	},
};

export { sessionServiceClient };
