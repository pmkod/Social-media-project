import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/http-client.ts";
import { getUserVerificationDataFromLocalStorage } from "../common/authentication.utils.ts";

type NewPasswordRequestBody = {
	newPassword: string;
};

const useNewPassword = () => {
	return useMutation({
		mutationFn: async (body: NewPasswordRequestBody) => {
			const data = getUserVerificationDataFromLocalStorage();
			if (!data?.userVerification) {
				throw new Error("Verification data not found");
			}
			await baseHttpClient.post("authentication/new-password", {
				json: {
					userVerification: {
						id: data.userVerification.id,
						token: data.userVerification.token,
					},
					newPassword: body.newPassword,
				},
			});
		},
	});
};

export { useNewPassword };
