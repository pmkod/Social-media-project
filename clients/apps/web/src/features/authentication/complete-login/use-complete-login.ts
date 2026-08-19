import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/http-client.ts";
import { saveAccessAndRefreshToken } from "@/core/utils/token.utils.ts";
import type { AuthenticatedResponse } from "../common/authenticated-response.ts";
import { getUserVerificationDataFromLocalStorage } from "../common/authentication.utils.ts";

type UseCompleteLoginResponseBody = AuthenticatedResponse & {
	hasStore: boolean;
};

const useCompleteLogin = () => {
	return useMutation({
		mutationFn: async () => {
			const data = getUserVerificationDataFromLocalStorage();
			if (!data?.userVerification) {
				throw new Error("Verification data not found");
			}
			const { accessToken, refreshToken, hasStore } = await baseHttpClient
				.post("authentication/complete-login", {
					json: {
						userVerification: {
							id: data.userVerification.id,
							token: data.userVerification.token,
						},
					},
				})
				.json<UseCompleteLoginResponseBody>();
			saveAccessAndRefreshToken({ accessToken, refreshToken });
			return { hasStore };
		},
	});
};

export { useCompleteLogin };
