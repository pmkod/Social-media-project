import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/http-client.ts";
import { saveSessionCredentials } from "@/core/utils/session.utils.ts";
import type { AuthenticatedResponse } from "../common/authenticated-response.ts";
import { getUserVerificationDataFromLocalStorage } from "../common/authentication.utils.ts";

const useCompleteLogin = () => {
	return useMutation({
		mutationFn: async () => {
			const data = getUserVerificationDataFromLocalStorage();
			if (!data?.userVerification) {
				throw new Error("Verification data not found");
			}
			const { session } = await baseHttpClient
				.post("authentication/complete-login", {
					json: {
						userVerification: {
							id: data.userVerification.id,
							token: data.userVerification.token,
						},
					},
				})
				.json<AuthenticatedResponse>();
			saveSessionCredentials({
				sessionId: session.id,
				sessionToken: session.token,
			});
		},
	});
};

export { useCompleteLogin };
