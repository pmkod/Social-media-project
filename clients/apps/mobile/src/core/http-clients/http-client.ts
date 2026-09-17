import {
	createSessionAuthorizationHeader,
	deleteSessionCredentials,
	getSessionCredentials,
} from "@/core/utils/session.utils";
import { baseHttpClient } from "./base.http-client";

const httpClient = baseHttpClient.extend({
	hooks: {
		beforeRequest: [
			async ({ request }) => {
				const credentials = await getSessionCredentials();
				if (credentials) {
					request.headers.set(
						"Authorization",
						createSessionAuthorizationHeader(credentials),
					);
				}
			},
		],
		afterResponse: [
			async ({ response }) => {
				if (response.status === 401) {
					await deleteSessionCredentials();
				}
				return response;
			},
		],
	},
});

export { baseHttpClient, httpClient };
