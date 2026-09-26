import { HTTPError } from "ky";
import { Configurations } from "../configurations";
import { HttpStatus } from "../constants/http-status";
import { Exception } from "../exceptions/exception";
import { UnauthorizedException } from "../exceptions/unauthorized.exception";
import { internalHttpClient } from "../http-clients/internal.http-client";
import type { AuthenticatedUser } from "../types/authenticated-user";

type VerifySessionResponse = {
	session?: {
		id?: string;
		userId?: string;
		active?: boolean;
	};
};

const sessionServiceHttpClient = internalHttpClient.extend({
	prefix: Configurations.session.serviceUrl,
});

const sessionServiceClient = {
	async verifySession(
		sessionId: string,
		sessionToken: string,
	): Promise<AuthenticatedUser> {
		let data: VerifySessionResponse;
		try {
			data = await sessionServiceHttpClient
				.post("internal/session/verify-session", {
					json: { id: sessionId, token: sessionToken },
				})
				.json<VerifySessionResponse>();
		} catch (error) {
			if (
				error instanceof HTTPError &&
				(error.response.status === HttpStatus.UNAUTHORIZED.code ||
					error.response.status === HttpStatus.NOT_FOUND.code)
			) {
				throw new UnauthorizedException();
			}

			throw new Exception({
				message: "Authentication service is temporarily unavailable",
				status: HttpStatus.SERVICE_UNAVAILABLE.code,
			});
		}

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
	},
};

export { sessionServiceClient };
