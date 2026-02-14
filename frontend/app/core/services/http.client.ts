import ky from "ky";
import {
	getAccessToken,
	getRefreshToken,
	saveAccessToken,
} from "../utils/authorization.utils";
import { BASE_API_URL } from "./api-url";

const baseHttpClient = ky.create({
	prefixUrl: BASE_API_URL,
	retry: { limit: 1 },
	hooks: {
		beforeError: [
			async (error) => {
				const { response } = error;
				if (response) {
					const errorJson = await response.json<{ message: string }>();
					error.message = errorJson.message;
				}

				return error;
			},
		],
	},
});

const httpClient = baseHttpClient.extend({
	hooks: {
		beforeRequest: [
			(request, _, { retryCount }) => {
				if (retryCount === 0) {
					const accessToken = getAccessToken();
					if (accessToken) {
						request.headers.set("Authorization", `Bearer ${accessToken}`);
					}
				}
			},
		],
		afterResponse: [
			async (request, _options, response, state) => {
				if (response.status === 401 && state.retryCount === 0) {
					// Only refresh on first 401, not on subsequent retries
					const refreshToken = getRefreshToken();
					if (!refreshToken) {
						throw Error();
					}
					const { accessToken } = await ky
						.post(`${BASE_API_URL}/authentication/access-tokens`, {
							json: {
								refreshToken,
							},
						})
						.json<{ accessToken: string }>();

					saveAccessToken(accessToken);

					const headers = new Headers(request.headers);
					headers.set("Authorization", `Bearer ${accessToken}`);

					return ky.retry({
						request: new Request(request, { headers }),
						// code: "TOKEN_REFRESHED",
					});
				}
			},
		],
	},
});

export { baseHttpClient, httpClient };
