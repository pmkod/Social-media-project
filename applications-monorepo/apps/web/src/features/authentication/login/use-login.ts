import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/http-client.ts";
import { saveUserVerificationDataToLocalStorage } from "../common/authentication.utils.ts";
import type { UserVerificationResponse } from "../common/user-verification-response.ts";

type LoginRequestBody = {
	emailOrUsername: string;
	password: string;
};

const useLogin = () => {
	return useMutation({
		mutationFn: async (body: LoginRequestBody) => {
			const { userVerification } = await baseHttpClient
				.post("authentication/login", {
					json: body,
				})
				.json<UserVerificationResponse>();
			saveUserVerificationDataToLocalStorage(userVerification);
		},
	});
};

export { useLogin };
