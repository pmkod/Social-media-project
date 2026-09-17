import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { saveUserVerificationData } from "@/features/authentication/common/authentication.utils";
import type { UserVerificationResponse } from "@/features/authentication/common/user-verification-response";

export const useRequestEmailChange = () => {
	return useMutation({
		mutationFn: async (newEmail: string) => {
			const response = await httpClient
				.post("users/me/email-change-request", { json: { newEmail } })
				.json<UserVerificationResponse>();

			await saveUserVerificationData(response.userVerification);
			return response;
		},
	});
};
