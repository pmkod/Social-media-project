import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/base.http-client";
import { saveSessionCredentials } from "@/core/utils/session.utils";
import type { AuthenticatedResponse } from "../common/authenticated-response";
import { getUserVerificationData } from "../common/authentication.utils";

export type CompleteSignupRequestBody = {
	username: string;
};

export const useCompleteSignup = () => {
	return useMutation({
		mutationFn: async (body: CompleteSignupRequestBody) => {
			const data = await getUserVerificationData();
			if (!data?.userVerification) {
				throw new Error("Verification data not found");
			}
			const { session } = await baseHttpClient
				.post<AuthenticatedResponse>("user/complete-signup", {
					json: {
						userVerification: {
							id: data.userVerification.id,
							token: data.userVerification.token,
						},
						username: body.username,
					},
				})
				.json();
			await saveSessionCredentials({
				sessionId: session.id,
				sessionToken: session.token,
			});
			return session;
		},
	});
};
