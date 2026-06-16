import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/http-client.ts";
import { saveAccessAndRefreshToken } from "@/core/utils/token.utils.ts";
import { getUserVerificationDataFromLocalStorage } from "../common/authentication.utils.ts";
import type { AuthenticatedResponse } from "../common/authenticated-response.ts";

const useCompleteSignup = () => {
	return useMutation({
		mutationFn: async () => {
			const data = getUserVerificationDataFromLocalStorage();
			if (!data?.userVerification) {
				throw new Error("Données de vérification introuvables");
			}
			const { accessToken, refreshToken } = await baseHttpClient
				.post("authentication/complete-signup", {
					json: {
						userVerification: {
							id: data.userVerification.id,
							token: data.userVerification.token,
						},
					},
				})
				.json<AuthenticatedResponse>();
			saveAccessAndRefreshToken({ accessToken, refreshToken });
		},
	});
};

export { useCompleteSignup };
