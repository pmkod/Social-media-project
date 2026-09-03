import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { saveUserVerificationDataToLocalStorage } from "@/features/authentication/common/authentication.utils.ts";
import type { UserVerificationResponse } from "@/features/authentication/common/user-verification-response.ts";

const useRequestEmailChange = () => {
	return useMutation({
		mutationFn: async (newEmail: string) => {
			const response = await httpClient
				.post("users/me/email-change-request", { json: { newEmail } })
				.json<UserVerificationResponse>();

			saveUserVerificationDataToLocalStorage(response.userVerification);
			return response;
		},
	});
};

export { useRequestEmailChange };
