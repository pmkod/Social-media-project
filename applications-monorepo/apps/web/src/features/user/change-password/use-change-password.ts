import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";

type ChangePasswordRequest = {
	currentPassword: string;
	newPassword: string;
};

const useChangePassword = () => {
	return useMutation({
		mutationFn: (body: ChangePasswordRequest) =>
			httpClient
				.put("users/me/password", { json: body })
				.json<{ message: string }>(),
	});
};

export { useChangePassword };
