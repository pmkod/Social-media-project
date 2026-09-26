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

const sessionServiceHttpClient = internalHttpClient.extend({
	prefix: Configurations.server.sessionServiceUrl,
});

const sessionServiceClient = {
	async createSession(input: CreateSessionInput): Promise<Session> {
		const data = await sessionServiceHttpClient
			.post("internal/session/create-session", { json: input })
			.json<CreateSessionResponse>();

		return { id: data.session.id, token: data.session.token };
	},

	async disableSession(userId: string, sessionId: string): Promise<void> {
		try {
			await sessionServiceHttpClient.patch(
				`session/disable-session/${encodeURIComponent(sessionId)}`,
				{
					headers: {
						"X-Authenticated-User-Id": userId,
						"X-Authenticated-Session-Id": sessionId,
					},
				},
			);
		} catch (error) {
			throw new Exception({
				message:
					error instanceof HTTPError
						? "Session service could not disable the session"
						: "Session service is temporarily unavailable",
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}
	},
};

export { sessionServiceClient };
