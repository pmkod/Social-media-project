import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/base.http-client";
import { getUserVerificationData } from "../common/authentication.utils";

type DoUserVerificationParams = {
	code: string;
};

export const useUserVerification = () => {
	return useMutation({
		mutationFn: async (body: DoUserVerificationParams) => {
			const data = await getUserVerificationData();
			if (!data?.userVerification) {
				throw new Error("Verification data not found");
			}
			return baseHttpClient
				.post("user/do-user-verification", {
					json: {
						userVerification: {
							id: data.userVerification.id,
							token: data.userVerification.token,
							code: body.code,
						},
					},
				})
				.json();
		},
	});
};
