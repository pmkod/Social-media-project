import { Configurations } from "@/core/configurations";
import { HTTPException } from "hono/http-exception";

type Session = {
	id: string;
	token: string;
};

type CreateSessionInput = {
	userId: string;
	ipAddress: string | null;
	userAgent: string | null;
};

class SessionServiceClient {
	private readonly baseUrl: string;

	constructor(baseUrl = Configurations.server.sessionServiceUrl) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}

	async createSession(input: CreateSessionInput): Promise<Session> {
		let response: Response;
		try {
			response = await fetch(`${this.baseUrl}/internal/sessions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
		} catch (_error) {
			throw new HTTPException(503, {
				message: "Session service is temporarily unavailable",
			});
		}

		if (!response.ok) {
			throw new HTTPException(503, {
				message: "Session service could not create the session",
			});
		}

		const data = (await response.json()) as { session?: Partial<Session> };
		if (!data.session?.id || !data.session.token) {
			throw new HTTPException(503, {
				message: "Session service returned an invalid response",
			});
		}

		return { id: data.session.id, token: data.session.token };
	}

	async disableSession(userId: string, sessionId: string): Promise<void> {
		let response: Response;
		try {
			response = await fetch(`${this.baseUrl}/sessions/${sessionId}/disable`, {
				method: "PATCH",
				headers: {
					"X-Authenticated-User-Id": userId,
					"X-Authenticated-Session-Id": sessionId,
				},
			});
		} catch (_error) {
			throw new HTTPException(503, {
				message: "Session service is temporarily unavailable",
			});
		}

		if (!response.ok) {
			throw new HTTPException(503, {
				message: "Session service could not disable the session",
			});
		}
	}
}

export const sessionServiceClient = new SessionServiceClient();
