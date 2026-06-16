import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/http-client.ts";
import type { UserVerificationResponse } from "../common/user-verification-response.ts";
import { saveUserVerificationDataToLocalStorage } from "../common/authentication.utils.ts";

type PasswordResetRequestBody = {
	email: string;
};

const usePasswordReset = () => {
	return useMutation({
		mutationFn: async (body: PasswordResetRequestBody) => {
			const { userVerification } = await baseHttpClient
				.post("authentication/password-reset", {
					json: body,
				})
				.json<UserVerificationResponse>();
			saveUserVerificationDataToLocalStorage(userVerification);
		},
	});
};

export { usePasswordReset };
