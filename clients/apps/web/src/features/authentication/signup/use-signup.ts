import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/http-client.ts";
import { saveUserVerificationDataToLocalStorage } from "../common/authentication.utils.ts";
import type { UserVerificationResponse } from "../common/user-verification-response.ts";

type SignupRequestBody = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
};

const useSignup = () => {
	return useMutation({
		mutationFn: async (body: SignupRequestBody) => {
			const { userVerification } = await baseHttpClient
				.post("authentication/signup", {
					json: body,
				})
				.json<UserVerificationResponse>();
			saveUserVerificationDataToLocalStorage(userVerification);
		},
	});
};

export { useSignup };
