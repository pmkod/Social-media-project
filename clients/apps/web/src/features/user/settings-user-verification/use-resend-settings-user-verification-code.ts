import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/http-client.ts";
import { getUserVerificationDataFromLocalStorage } from "@/features/authentication/common/authentication.utils.ts";

const useResendSettingsUserVerificationCode = () => {
	return useMutation({
		mutationFn: () => {
			const data = getUserVerificationDataFromLocalStorage();
			if (!data?.userVerification) {
				throw new Error("Verification data not found");
			}
			return baseHttpClient.post(
				"authentication/resend-user-verification-code",
				{
					json: {
						userVerification: {
							id: data.userVerification.id,
							token: data.userVerification.token,
						},
					},
				},
			);
		},
	});
};

export { useResendSettingsUserVerificationCode };
