import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/base.http-client";
import { saveSessionCredentials } from "@/core/utils/session.utils";
import type { AuthenticatedResponse } from "../common/authenticated-response";
import { getUserVerificationData } from "../common/authentication.utils";

export type NewPasswordRequestBody = {
	newPassword: string;
};

export const useNewPassword = () => {
	return useMutation({
		mutationFn: async (body: NewPasswordRequestBody) => {
			const data = await getUserVerificationData();
			if (!data?.userVerification) {
				throw new Error("Verification data not found");
			}
			const { session } = await baseHttpClient
				.post<AuthenticatedResponse>("authentication/new-password", {
					json: {
						userVerification: {
							id: data.userVerification.id,
							token: data.userVerification.token,
						},
						newPassword: body.newPassword,
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
