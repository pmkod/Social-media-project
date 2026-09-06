import { HTTPException } from "hono/http-exception";
import { Configurations } from "../configurations";
import { UnauthorizedException } from "../exceptions/unauthorized.exception";
import type { AuthenticatedUser } from "../types/authenticated-user";

type VerifySessionResponse = {
	session?: {
		id?: string;
		userId?: string;
		active?: boolean;
	};
};

class SessionServiceClient {
	private readonly baseUrl: string;

	constructor(baseUrl = Configurations.session.serviceUrl) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}

	async verifySession(
		sessionId: string,
		sessionToken: string,
	): Promise<AuthenticatedUser> {
		let response: Response;
		try {
			response = await fetch(`${this.baseUrl}/internal/sessions/verify`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: sessionId, token: sessionToken }),
			});
		} catch (_error) {
			throw new HTTPException(503, {
				message: "Authentication service is temporarily unavailable",
			});
		}

		if (response.status === 401 || response.status === 404) {
			throw new UnauthorizedException("Invalid or inactive session");
		}
		if (!response.ok) {
			throw new HTTPException(503, {
				message: "Authentication service is temporarily unavailable",
			});
		}

		const data = (await response.json()) as VerifySessionResponse;
		if (
			!data.session?.id ||
			!data.session.userId ||
			data.session.active !== true ||
			data.session.id !== sessionId
		) {
			throw new HTTPException(503, {
				message: "Authentication service returned an invalid response",
			});
		}

		return { id: data.session.userId, sessionId: data.session.id };
	}
}

export const sessionServiceClient = new SessionServiceClient();
