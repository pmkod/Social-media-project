import { useMutation } from "@tanstack/react-query";
import { baseHttpClient } from "@/core/http-clients/http-client.ts";
import { getUserVerificationDataFromLocalStorage } from "../common/authentication.utils.ts";

type DoUserVerificationParams = {
	code: string;
};

const useUserVerification = () => {
	return useMutation({
		mutationFn: (body: DoUserVerificationParams) => {
			const data = getUserVerificationDataFromLocalStorage();
			if (!data?.userVerification) {
				throw new Error("Données de vérification introuvables");
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

export { useUserVerification };
