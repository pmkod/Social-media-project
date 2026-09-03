import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/http-client.ts";
import { getUserVerificationDataFromLocalStorage } from "@/features/authentication/common/authentication.utils.ts";

type DoSettingsUserVerificationParams = {
	code: string;
};

const useSettingsUserVerification = () => {
	return useMutation({
		mutationFn: (body: DoSettingsUserVerificationParams) => {
			const data = getUserVerificationDataFromLocalStorage();
			if (!data?.userVerification) {
				throw new Error("Verification data not found");
			}
			return baseHttpClient.post("authentication/user-verification", {
				json: {
					userVerification: {
						id: data.userVerification.id,
						token: data.userVerification.token,
						code: body.code,
					},
				},
			});
		},
	});
};

export { useSettingsUserVerification };
