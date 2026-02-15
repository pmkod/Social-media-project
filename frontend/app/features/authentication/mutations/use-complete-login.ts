import { baseHttpClient } from "@/core/services/http.client";
import { saveAccessAndRefreshToken } from "@/core/utils/authorization.utils";
import { userQueryKeys } from "@/features/user/user.query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserVerificationDataFromLocalStorage } from "../authentication.utils";
import type { AuthenticatedResponse } from "../types/authenticated-response";

const useCompleteLogin = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			const { userVerification } = getUserVerificationDataFromLocalStorage();
			const { accessToken, refreshToken } = await baseHttpClient
				.post("authentication/complete-login", {
					json: {
						userVerification: {
							id: userVerification.id,
							token: userVerification.token,
						},
					},
				})
				.json<AuthenticatedResponse>();
			saveAccessAndRefreshToken({ accessToken, refreshToken });
			queryClient.refetchQueries({
				queryKey: userQueryKeys.loggedInUser.queryKey,
			});
		},
	});
};

export { useCompleteLogin };
