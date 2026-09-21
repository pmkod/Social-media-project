import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/base.http-client";
import { saveUserVerificationData } from "../common/authentication.utils";
import type { UserVerificationResponse } from "../common/user-verification-response";

export type SignupRequestBody = {
	fullName: string;
	email: string;
	password: string;
};

export const useSignup = () => {
	return useMutation({
		mutationFn: async (body: SignupRequestBody) => {
			const { userVerification } = await baseHttpClient
				.post<UserVerificationResponse>("user/signup", {
					json: body,
				})
				.json();
			await saveUserVerificationData(userVerification);
			return userVerification;
		},
	});
};
