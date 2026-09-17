import {
	createSessionAuthorizationHeader,
	deleteSessionCredentials,
	getSessionCredentials,
} from "@/core/utils/session.utils.ts";
import { baseHttpClient } from "./base.http-client.ts";

const httpClient = baseHttpClient.extend({
	hooks: {
		beforeRequest: [
			({ request }) => {
				const credentials = getSessionCredentials();
				if (credentials) {
					request.headers.set(
						"Authorization",
						createSessionAuthorizationHeader(credentials),
					);
				}
			},
		],
		afterResponse: [
			({ response }) => {
				if (response.status === 401) deleteSessionCredentials();
				return response;
			},
		],
	},
});

export { baseHttpClient, httpClient };
