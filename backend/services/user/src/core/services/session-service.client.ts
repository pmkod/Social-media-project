import { Configurations } from "@/core/configurations";
import { HttpStatus } from "@/core/constants/http-status";
import { Exception } from "@/core/exceptions/exception";

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
			response = await fetch(`${this.baseUrl}/internal/session/create-session`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
		} catch (_error) {
			throw new Exception({
				message: "Session service is temporarily unavailable",
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}

		if (!response.ok) {
			throw new Exception({
				message: "Session service could not create the session",
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}

		const data = (await response.json()) as { session?: Partial<Session> };
		if (!data.session?.id || !data.session.token) {
			throw new Exception({
				message: "Session service returned an invalid response",
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}

		return { id: data.session.id, token: data.session.token };
	}

	async disableSession(userId: string, sessionId: string): Promise<void> {
		let response: Response;
		try {
			response = await fetch(`${this.baseUrl}/session/disable-session/${sessionId}`, {
				method: "PATCH",
				headers: {
					"X-Authenticated-User-Id": userId,
					"X-Authenticated-Session-Id": sessionId,
				},
			});
		} catch (_error) {
			throw new Exception({
				message: "Session service is temporarily unavailable",
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}

		if (!response.ok) {
			throw new Exception({
				message: "Session service could not disable the session",
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}
	}
}

export const sessionServiceClient = new SessionServiceClient();
