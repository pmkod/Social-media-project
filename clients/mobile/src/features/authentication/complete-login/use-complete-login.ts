import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/base.http-client";
import { saveSessionCredentials } from "@/core/utils/session.utils";
import type { AuthenticatedResponse } from "../common/authenticated-response";
import { getUserVerificationData } from "../common/authentication.utils";

export const useCompleteLogin = () => {
	return useMutation({
		mutationFn: async () => {
			const data = await getUserVerificationData();
			if (!data?.userVerification) {
				throw new Error("Verification data not found");
			}
			const { session } = await baseHttpClient
				.post<AuthenticatedResponse>("authentication/complete-login", {
					json: {
						userVerification: {
							id: data.userVerification.id,
							token: data.userVerification.token,
						},
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
