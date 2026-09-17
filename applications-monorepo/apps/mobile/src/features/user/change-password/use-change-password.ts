import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";

type ChangePasswordRequest = {
	currentPassword: string;
	newPassword: string;
};

export const useChangePassword = () => {
	return useMutation({
		mutationFn: (body: ChangePasswordRequest) =>
			httpClient
				.put("users/me/password", { json: body })
				.json<{ message: string }>(),
	});
};
