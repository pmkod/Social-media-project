import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { getUserVerificationData } from "@/features/authentication/common/authentication.utils";

export const useCompleteEmailChange = () => {
	return useMutation({
		mutationFn: async () => {
			const data = await getUserVerificationData();
			return httpClient
				.put("user/change-email", { json: { userVerification: data?.userVerification } })
				.json<{ message: string; email: string }>();
		},
	});
};
