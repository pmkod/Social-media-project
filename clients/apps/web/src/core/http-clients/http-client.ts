import ky from "ky";
import { ApiConfig } from "@/core/configs/api.config.ts";
import {
	getAccessToken,
	getRefreshToken,
	saveAccessToken,
} from "@/core/utils/token.utils.ts";
import type {
	RefreshTokenRequest,
	RefreshTokenResponse,
} from "@/features/authentication/common/refresh-token.ts";
import { baseHttpClient } from "./base.http-client.ts";

const httpClient = baseHttpClient.extend({
	hooks: {
		beforeRequest: [
			({ retryCount, request }) => {
				if (retryCount === 0) {
					const accessToken = getAccessToken();
					if (accessToken) {
						request.headers.set("Authorization", `Bearer ${accessToken}`);
					}
				}
			},
		],
		afterResponse: [
			async ({ request, response, retryCount }) => {
				if (response.status === 401 && retryCount === 0) {
					const refreshToken = getRefreshToken();
					if (!refreshToken) {
						throw Error();
					}
					const { accessToken } = await ky
						.post(`${ApiConfig.baseUrl}/authentication/refresh-token`, {
							json: {
								refreshToken,
							} satisfies RefreshTokenRequest,
						})
						.json<RefreshTokenResponse>();

					saveAccessToken(accessToken);

					const headers = new Headers(request.headers);
					headers.set("Authorization", `Bearer ${accessToken}`);

					return baseHttpClient(new Request(request, { headers }));
				}
			},
		],
	},
});

export { baseHttpClient, httpClient };
