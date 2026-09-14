import { Configurations } from "../configurations";
import { HttpStatus } from "../constants/http-status";
import { Exception } from "../exceptions/exception";
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
			throw new Exception({
				message: "Authentication service is temporarily unavailable",
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}

		if (
			response.status === HttpStatus.UNAUTHORIZED.code ||
			response.status === HttpStatus.NOT_FOUND.code
		) {
			throw new UnauthorizedException();
		}
		if (!response.ok) {
			throw new Exception({
				message: "Authentication service is temporarily unavailable",
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}

		const data = (await response.json()) as VerifySessionResponse;
		if (
			!data.session?.id ||
			!data.session.userId ||
			data.session.active !== true ||
			data.session.id !== sessionId
		) {
			throw new Exception({
				message: "Authentication service returned an invalid response",
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}

		return { id: data.session.userId, sessionId: data.session.id };
	}
}

export const sessionServiceClient = new SessionServiceClient();
