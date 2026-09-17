import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/base.http-client";
import { getUserVerificationData } from "../common/authentication.utils";

export const useResendUserVerificationCode = () => {
	return useMutation({
		mutationFn: async () => {
			const data = await getUserVerificationData();
			if (!data?.userVerification) {
				throw new Error("Verification data not found");
			}
			return baseHttpClient
				.post("authentication/resend-user-verification-code", {
					json: {
						userVerification: {
							id: data.userVerification.id,
							token: data.userVerification.token,
						},
					},
				})
				.json();
		},
	});
};
