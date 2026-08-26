import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import {
	getUserVerificationDataFromLocalStorage,
	saveUserVerificationDataToLocalStorage,
} from "@/features/authentication/common/authentication.utils.ts";
import type { UserVerificationResponse } from "@/features/authentication/common/user-verification-response.ts";

type ChangePasswordRequest = {
	currentPassword: string;
	newPassword: string;
};

const useChangePassword = () => {
	return useMutation({
		mutationFn: (body: ChangePasswordRequest) =>
			httpClient
				.put("users/me/password", { json: body })
				.json<{ success: boolean }>(),
	});
};

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

const useCompleteEmailChange = () => {
	return useMutation({
		mutationFn: () => {
			const { userVerification } = getUserVerificationDataFromLocalStorage();
			return httpClient
				.put("users/me/email", { json: { userVerification } })
				.json<{ success: boolean; email: string }>();
		},
	});
};

export { useChangePassword, useCompleteEmailChange, useRequestEmailChange };
