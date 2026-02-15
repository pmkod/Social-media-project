import { baseHttpClient } from "@/core/services/http.client";
import { saveAccessAndRefreshToken } from "@/core/utils/authorization.utils";
import { userQueryKeys } from "@/features/user/user.query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserVerificationDataFromLocalStorage } from "../authentication.utils";
import type { AuthenticatedResponse } from "../types/authenticated-response";

type CompleteSignupRequestBody = {
	fullName: string;
	username: string;
	password: string;
};

const useCompleteSignup = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			fullName,
			username,
			password,
		}: CompleteSignupRequestBody) => {
			const { userVerification } = getUserVerificationDataFromLocalStorage();
			const { accessToken, refreshToken } = await baseHttpClient
				.post("authentication/complete-signup", {
					json: {
						userVerification: {
							id: userVerification.id,
							token: userVerification.token,
						},
						fullName,
						username,
						password,
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

export { useCompleteSignup };
