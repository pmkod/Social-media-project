import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/http-client.ts";
import { saveSessionCredentials } from "@/core/utils/session.utils.ts";
import type { AuthenticatedResponse } from "../common/authenticated-response.ts";
import { getUserVerificationDataFromLocalStorage } from "../common/authentication.utils.ts";

type CompleteSignupRequestBody = {
	username: string;
};

const useCompleteSignup = () => {
	return useMutation({
		mutationFn: async (body: CompleteSignupRequestBody) => {
			const data = getUserVerificationDataFromLocalStorage();
			if (!data?.userVerification) {
				throw new Error("Verification data not found");
			}
			const { session } = await baseHttpClient
				.post("authentication/complete-signup", {
					json: {
						userVerification: {
							id: data.userVerification.id,
							token: data.userVerification.token,
						},
						username: body.username,
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

export { useCompleteSignup };
