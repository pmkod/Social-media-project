import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { getUserVerificationDataFromLocalStorage } from "@/features/authentication/common/authentication.utils.ts";

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

export { useCompleteEmailChange };
