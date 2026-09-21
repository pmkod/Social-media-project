import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/base.http-client";
import { saveUserVerificationData } from "../common/authentication.utils";
import type { UserVerificationResponse } from "../common/user-verification-response";

export type LoginRequestBody = {
	emailOrUsername: string;
	password: string;
};

export const useLogin = () => {
	return useMutation({
		mutationFn: async (body: LoginRequestBody) => {
			const { userVerification } = await baseHttpClient
				.post<UserVerificationResponse>("user/login", {
					json: body,
				})
				.json();
			await saveUserVerificationData(userVerification);
			return userVerification;
		},
	});
};
